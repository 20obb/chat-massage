const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { auth } = require('../middlewares/auth');

/**
 * @route   GET /messages/:chatId
 * @desc    Get messages for a chat with pagination
 * @access  Private
 */
router.get('/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 50, before } = req.query;

        // Verify user is participant in chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or access denied.'
            });
        }

        // Build query for pagination
        const query = { chatId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Get messages (newest first for pagination, will reverse for display)
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('senderId', 'email');

        // Mark messages as seen
        await Message.markAsSeen(chatId, req.userId);

        res.status(200).json({
            success: true,
            messages: messages.reverse(), // Return in chronological order
            hasMore: messages.length === parseInt(limit)
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages.'
        });
    }
});

/**
 * @route   POST /messages/:chatId
 * @desc    Send a message (backup for when socket fails)
 * @access  Private
 */
router.post('/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required.'
            });
        }

        // Verify user is participant in chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or access denied.'
            });
        }

        // Create message
        const message = await Message.create({
            chatId,
            senderId: req.userId,
            content: content.trim()
        });

        // Update chat's last message
        await Chat.updateLastMessage(chatId, message);

        // Populate sender info
        await message.populate('senderId', 'email');

        res.status(201).json({
            success: true,
            message
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message.'
        });
    }
});

/**
 * @route   PUT /messages/:chatId/seen
 * @desc    Mark messages as seen
 * @access  Private
 */
router.put('/:chatId/seen', auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        // Verify user is participant in chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or access denied.'
            });
        }

        // Mark all messages as seen
        const result = await Message.markAsSeen(chatId, req.userId);

        res.status(200).json({
            success: true,
            markedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Mark seen error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as seen.'
        });
    }
});

module.exports = router;
