const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user information for the chat application
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    displayName: {
        type: String,
        trim: true
    },
    avatar: {
        type: String, // URL or base64
        default: ''
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });

// Virtual for display name (uses email prefix if displayName is not set)
userSchema.virtual('name').get(function () {
    if (this.displayName) return this.displayName;
    return this.email.split('@')[0];
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
