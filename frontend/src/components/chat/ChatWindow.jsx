import { useState, useEffect, useRef, useCallback } from 'react';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useSocket } from '../../contexts/SocketContext';
import { messageAPI } from '../../services/api';

/**
 * ChatWindow Component
 * Main chat area with messages
 */
export default function ChatWindow({ chat, currentUser, onClose }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    const { socket, joinChat, leaveChat, sendMessage, sendTyping, isUserOnline } = useSocket();

    const participant = chat?.participant;
    const isOnline = participant ? isUserOnline(participant._id) : false;

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Load messages
    useEffect(() => {
        if (!chat?._id) return;

        const loadMessages = async () => {
            setLoading(true);
            try {
                const response = await messageAPI.getMessages(chat._id);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [chat?._id]);

    // Join chat room and setup listeners
    useEffect(() => {
        if (!chat?._id || !socket) return;

        joinChat(chat._id);

        // Listen for new messages
        const handleNewMessage = (data) => {
            if (data.message.chatId === chat._id) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
        };

        // Listen for typing indicator
        const handleTyping = (data) => {
            if (data.userId !== currentUser._id) {
                setTypingUser(data.isTyping ? data.email : null);

                // Clear typing after timeout
                if (data.isTyping) {
                    setTimeout(() => setTypingUser(null), 3000);
                }
            }
        };

        // Listen for seen status
        const handleMessagesSeen = (data) => {
            if (data.chatId === chat._id) {
                setMessages(prev => prev.map(msg =>
                    msg.senderId._id === currentUser._id || msg.senderId === currentUser._id
                        ? { ...msg, seen: true }
                        : msg
                ));
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('messages_seen', handleMessagesSeen);

        return () => {
            leaveChat(chat._id);
            socket.off('receive_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('messages_seen', handleMessagesSeen);
        };
    }, [chat?._id, socket, joinChat, leaveChat, currentUser._id, scrollToBottom]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = (content) => {
        if (socket) {
            sendMessage(chat._id, content);
        }
    };

    const handleTyping = (isTyping) => {
        sendTyping(chat._id, isTyping);
    };

    // Format last seen time
    const formatLastSeen = (date) => {
        if (!date) return 'Unknown';
        const lastSeen = new Date(date);
        const now = new Date();
        const diff = now - lastSeen;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-dark-400">
                <div className="text-center text-gray-500">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-medium mb-2">Select a chat</h3>
                    <p>Choose a conversation or start a new one</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-dark-400">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-dark-300 border-b border-dark-200">
                {/* Back button (mobile) */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 -ml-2 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <Avatar email={participant?.email || ''} isOnline={isOnline} size="md" />

                <div className="flex-1">
                    <h2 className="font-semibold text-white">
                        {participant?.email?.split('@')[0] || 'Unknown'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {isOnline ? (
                            <span className="text-green-400">Online</span>
                        ) : (
                            <span>Last seen {formatLastSeen(participant?.lastSeen)}</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isOwn={
                                    (msg.senderId._id || msg.senderId) === currentUser._id
                                }
                            />
                        ))}
                    </>
                )}

                {/* Typing indicator */}
                {typingUser && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm animate-fade-in">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>{typingUser.split('@')[0]} is typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput
                onSend={handleSendMessage}
                onTyping={handleTyping}
            />
        </div>
    );
}
