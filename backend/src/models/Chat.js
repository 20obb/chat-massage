const mongoose = require('mongoose');

/**
 * Chat Schema
 * Represents a conversation between two users
 */
const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        content: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster participant lookups
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

/**
 * Static method to find or create a chat between two users
 * @param {string} userId1 - First user's ID
 * @param {string} userId2 - Second user's ID
 * @returns {Object} - Chat document
 */
chatSchema.statics.findOrCreateChat = async function (userId1, userId2) {
    // Look for existing chat with both participants
    let chat = await this.findOne({
        participants: { $all: [userId1, userId2] }
    }).populate('participants', 'email isOnline lastSeen');

    // Create new chat if doesn't exist
    if (!chat) {
        chat = await this.create({
            participants: [userId1, userId2]
        });
        chat = await chat.populate('participants', 'email isOnline lastSeen');
    }

    return chat;
};

/**
 * Update last message for the chat
 * @param {string} chatId - Chat ID
 * @param {Object} message - Message object
 */
chatSchema.statics.updateLastMessage = async function (chatId, message) {
    return this.findByIdAndUpdate(chatId, {
        lastMessage: {
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt
        },
        updatedAt: new Date()
    }, { new: true });
};

module.exports = mongoose.model('Chat', chatSchema);
