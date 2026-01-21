const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending OTP emails to users
 */

// Create transporter based on environment
let transporter;

const initializeTransporter = async () => {
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
        // Use Ethereal for development (fake SMTP)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('📧 Using Ethereal test email account');
    } else if (process.env.SMTP_HOST) {
        // Use configured SMTP
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('📧 Using configured SMTP server');
    }
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {Object} - Email send result
 */
const sendOTPEmail = async (email, otp) => {
    // In development without SMTP, just log to console
    if (!transporter) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 OTP for ${email}: ${otp}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { success: true, preview: null };
    }

    const mailOptions = {
        from: `"ChatMassage" <${process.env.SMTP_USER || 'noreply@chatmassage.com'}>`,
        to: email,
        subject: 'Your Login Code - ChatMassage',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 400px; margin: 0 auto; padding: 40px 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #0088cc; margin-bottom: 30px; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; 
                  background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
          .note { color: #666; font-size: 14px; margin-top: 20px; }
          .warning { color: #ff6b6b; font-size: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">💬 ChatMassage</div>
          <p>Your login verification code is:</p>
          <div class="code">${otp}</div>
          <p class="note">This code will expire in 5 minutes.</p>
          <p class="warning">If you didn't request this code, please ignore this email.</p>
        </div>
      </body>
      </html>
    `,
        text: `Your ChatMassage login code is: ${otp}. This code expires in 5 minutes.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        // For Ethereal, get preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📧 Preview URL: ${previewUrl}`);
        }

        return { success: true, preview: previewUrl };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

module.exports = { initializeTransporter, sendOTPEmail };
