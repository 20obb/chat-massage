const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * OTP Schema
 * Stores hashed OTP codes with expiration and attempt tracking
 */
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    hashedCode: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto delete when expired
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
otpSchema.index({ email: 1 });

/**
 * Static method to generate and hash OTP
 * @param {string} email - User's email
 * @returns {Object} - Contains the plain OTP and saved document
 */
otpSchema.statics.generateOTP = async function (email) {
    // Delete any existing OTPs for this email
    await this.deleteMany({ email: email.toLowerCase() });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(otp, salt);

    // Calculate expiry (default 5 minutes)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Create new OTP document
    const otpDoc = await this.create({
        email: email.toLowerCase(),
        hashedCode,
        expiresAt
    });

    return { otp, otpDoc };
};

/**
 * Instance method to verify OTP
 * @param {string} code - Plain OTP code to verify
 * @returns {boolean} - True if OTP is valid
 */
otpSchema.methods.verifyOTP = async function (code) {
    // Check if expired
    if (new Date() > this.expiresAt) {
        return false;
    }

    // Check if max attempts exceeded
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
    if (this.attempts >= maxAttempts) {
        return false;
    }

    // Increment attempts
    this.attempts += 1;
    await this.save();

    // Verify the code
    return bcrypt.compare(code, this.hashedCode);
};

module.exports = mongoose.model('OTP', otpSchema);
