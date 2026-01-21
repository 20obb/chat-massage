const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

/**
 * Socket.io Handler
 * Manages real-time messaging and user presence
 */

// Store connected users: { oderId: socketId }
const connectedUsers = new Map();

const initializeSocket = (io) => {
    // Authentication middleware for Socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user || !user.isVerified) {
                return next(new Error('User not found or not verified'));
            }

            // Attach user to socket
            socket.userId = user._id.toString();
            socket.user = user;

            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        console.log(`✅ User connected: ${socket.user.email}`);

        // Store socket connection
        connectedUsers.set(userId, socket.id);

        // Update user online status
        await User.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: new Date()
        });

        // Broadcast user online status to all
        socket.broadcast.emit('user_online', {
            userId,
            email: socket.user.email
        });

        /**
         * Join chat room
         * Allows user to receive messages for specific chats
         */
        socket.on('join', async (chatId) => {
            try {
                // Verify user is participant
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId
                });

                if (chat) {
                    socket.join(chatId);
                    console.log(`User ${socket.user.email} joined chat ${chatId}`);

                    // Mark messages as seen when joining
                    await Message.markAsSeen(chatId, userId);

                    // Notify other participants that messages are seen
                    socket.to(chatId).emit('messages_seen', {
                        chatId,
                        userId
                    });
                }
            } catch (error) {
                console.error('Join chat error:', error);
            }
        });

        /**
         * Leave chat room
         */
        socket.on('leave', (chatId) => {
            socket.leave(chatId);
            console.log(`User ${socket.user.email} left chat ${chatId}`);
        });

        /**
         * Send message
         * Creates message and broadcasts to chat participants
         */
        socket.on('send_message', async (data) => {
            try {
                const { chatId, content } = data;

                if (!chatId || !content || !content.trim()) {
                    socket.emit('error', { message: 'Invalid message data' });
                    return;
                }

                // Verify user is participant
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId
                });

                if (!chat) {
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }

                // Create message
                const message = await Message.create({
                    chatId,
                    senderId: userId,
                    content: content.trim()
                });

                // Update chat's last message
                await Chat.updateLastMessage(chatId, message);

                // Populate sender info
                await message.populate('senderId', 'email');

                // Emit to all participants in the chat room
                io.to(chatId).emit('receive_message', {
                    message: {
                        _id: message._id,
                        chatId: message.chatId,
                        senderId: message.senderId,
                        content: message.content,
                        seen: message.seen,
                        createdAt: message.createdAt
                    }
                });

                // Also emit chat_updated for sidebar update
                chat.participants.forEach(participantId => {
                    const participantSocketId = connectedUsers.get(participantId.toString());
                    if (participantSocketId) {
                        io.to(participantSocketId).emit('chat_updated', {
                            chatId,
                            lastMessage: {
                                content: message.content,
                                senderId: message.senderId._id,
                                createdAt: message.createdAt
                            }
                        });
                    }
                });

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        /**
         * Mark messages as seen
         */
        socket.on('mark_seen', async (data) => {
            try {
                const { chatId } = data;

                await Message.markAsSeen(chatId, userId);

                // Notify sender that messages are seen
                socket.to(chatId).emit('messages_seen', {
                    chatId,
                    userId
                });

            } catch (error) {
                console.error('Mark seen error:', error);
            }
        });

        /**
         * Typing indicator
         */
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(chatId).emit('user_typing', {
                userId,
                email: socket.user.email,
                isTyping
            });
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', async () => {
            console.log(`❌ User disconnected: ${socket.user.email}`);

            // Remove from connected users
            connectedUsers.delete(userId);

            // Update user offline status
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date()
            });

            // Broadcast user offline status
            socket.broadcast.emit('user_offline', {
                userId,
                lastSeen: new Date()
            });
        });
    });
};

// Helper to get socket ID for a user
const getSocketId = (userId) => connectedUsers.get(userId);

// Helper to check if user is online
const isUserOnline = (userId) => connectedUsers.has(userId);

module.exports = { initializeSocket, getSocketId, isUserOnline };
