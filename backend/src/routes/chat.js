const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');
const { formatChat, sanitizeUser } = require('../utils/helpers');

/**
 * @route   GET /chats
 * @desc    Get all chats for current user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        // Find all chats where user is a participant
        const chats = await Chat.find({
            participants: req.userId
        })
            .populate('participants', 'email isOnline lastSeen')
            .sort({ updatedAt: -1 });

        // Format chats with unread counts
        const formattedChats = await Promise.all(
            chats.map(async (chat) => {
                const formatted = formatChat(chat, req.userId);
                formatted.unreadCount = await Message.getUnreadCount(chat._id, req.userId);
                return formatted;
            })
        );

        res.status(200).json({
            success: true,
            chats: formattedChats
        });

    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chats.'
        });
    }
});

/**
 * @route   POST /chats
 * @desc    Create or get existing chat with another user
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: 'Participant ID is required.'
            });
        }

        // Check if participant exists
        const participant = await User.findById(participantId);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Prevent chat with self
        if (participantId === req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create chat with yourself.'
            });
        }

        // Find or create chat
        const chat = await Chat.findOrCreateChat(req.userId, participantId);

        res.status(200).json({
            success: true,
            chat: formatChat(chat, req.userId)
        });

    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create chat.'
        });
    }
});

/**
 * @route   GET /chats/:chatId
 * @desc    Get single chat by ID
 * @access  Private
 */
router.get('/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.userId
        }).populate('participants', 'email isOnline lastSeen');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found.'
            });
        }

        res.status(200).json({
            success: true,
            chat: formatChat(chat, req.userId)
        });

    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat.'
        });
    }
});

module.exports = router;
