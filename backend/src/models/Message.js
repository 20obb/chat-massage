const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores individual messages within chats
 */
const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    seen: {
        type: Boolean,
        default: false
    },
    seenAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient chat message queries
messageSchema.index({ chatId: 1, createdAt: -1 });

/**
 * Mark messages as seen
 * @param {string} chatId - Chat ID
 * @param {string} userId - User who is reading (not the sender)
 */
messageSchema.statics.markAsSeen = async function (chatId, userId) {
    return this.updateMany(
        {
            chatId,
            senderId: { $ne: userId },
            seen: false
        },
        {
            seen: true,
            seenAt: new Date()
        }
    );
};

/**
 * Get unread count for a user in a chat
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 */
messageSchema.statics.getUnreadCount = async function (chatId, userId) {
    return this.countDocuments({
        chatId,
        senderId: { $ne: userId },
        seen: false
    });
};

module.exports = mongoose.model('Message', messageSchema);
