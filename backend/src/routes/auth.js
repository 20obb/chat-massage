const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const { auth, generateToken } = require('../middlewares/auth');
const { authLimiter, otpRequestLimiter } = require('../middlewares/rateLimiter');
const { sendOTPEmail } = require('../services/emailService');
const { isValidEmail, sanitizeUser } = require('../utils/helpers');

/**
 * @route   POST /auth/request-otp
 * @desc    Request OTP for email login
 * @access  Public
 */
router.post('/request-otp', otpRequestLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Generate OTP (will delete any existing OTPs for this email)
        const { otp, otpDoc } = await OTP.generateOTP(normalizedEmail);

        // Send OTP via email
        await sendOTPEmail(normalizedEmail, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email address.',
            expiresAt: otpDoc.expiresAt
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
});

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP and login/register user
 * @access  Public
 */
router.post('/verify-otp', authLimiter, async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validate input
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (!code || code.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit OTP code.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find OTP document
        const otpDoc = await OTP.findOne({ email: normalizedEmail });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new code.'
            });
        }

        // Check max attempts
        const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
        if (otpDoc.attempts >= maxAttempts) {
            await OTP.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new code.'
            });
        }

        // Verify OTP
        const isValid = await otpDoc.verifyOTP(code);

        if (!isValid) {
            const remainingAttempts = maxAttempts - otpDoc.attempts;
            return res.status(400).json({
                success: false,
                message: `Invalid OTP code. ${remainingAttempts} attempts remaining.`,
                remainingAttempts
            });
        }

        // OTP verified - find or create user
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Auto-create new user
            user = await User.create({
                email: normalizedEmail,
                isVerified: true
            });
        } else {
            // Update existing user
            user.isVerified = true;
            user.lastSeen = new Date();
            await user.save();
        }

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpDoc._id });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: sanitizeUser(user)
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
});

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: sanitizeUser(req.user)
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile.'
        });
    }
});

/**
 * @route   PUT /auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', auth, async (req, res) => {
    try {
        const { displayName, avatar } = req.body;
        const user = req.user;

        if (displayName !== undefined) {
            user.displayName = displayName;
        }

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: sanitizeUser(user)
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user profile.'
        });
    }
});

/**
 * @route   GET /auth/users
 * @desc    Search for users by email
 * @access  Private
 */
router.get('/users', auth, async (req, res) => {
    try {
        const { search } = req.query;

        // Find users matching email (exclude current user)
        const query = {
            _id: { $ne: req.userId },
            isVerified: true
        };

        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        const users = await User.find(query)
            .select('email isOnline lastSeen')
            .limit(20);

        res.status(200).json({
            success: true,
            users: users.map(sanitizeUser)
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users.'
        });
    }
});

module.exports = router;
