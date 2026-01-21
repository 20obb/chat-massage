/**
 * Utility Helper Functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Sanitize user object for response (remove sensitive fields)
 * @param {Object} user - Mongoose user document
 * @returns {Object} - Safe user object
 */
const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    return {
        _id: userObj._id,
        email: userObj.email,
        displayName: userObj.email.split('@')[0],
        isVerified: userObj.isVerified,
        isOnline: userObj.isOnline,
        lastSeen: userObj.lastSeen,
        createdAt: userObj.createdAt
    };
};

/**
 * Format chat for response with other participant info
 * @param {Object} chat - Chat document
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} - Formatted chat object
 */
const formatChat = (chat, currentUserId) => {
    const chatObj = chat.toObject ? chat.toObject() : chat;
    const otherParticipant = chatObj.participants.find(
        p => p._id.toString() !== currentUserId.toString()
    );

    return {
        _id: chatObj._id,
        participant: otherParticipant ? sanitizeUser(otherParticipant) : null,
        lastMessage: chatObj.lastMessage,
        updatedAt: chatObj.updatedAt,
        createdAt: chatObj.createdAt
    };
};

module.exports = { isValidEmail, sanitizeUser, formatChat };
