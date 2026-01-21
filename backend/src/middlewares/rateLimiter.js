const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Auth Endpoints
 * Prevents brute force attacks on OTP verification
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Stricter rate limiter for OTP requests
 * Prevents email spam
 */
const otpRequestLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 OTP requests per minute
    message: {
        success: false,
        message: 'Too many OTP requests. Please wait before requesting another code.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { authLimiter, otpRequestLimiter, apiLimiter };
