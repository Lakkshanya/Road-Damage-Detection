const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create nodemailer transporter config (You will need to fill in real SMTP info in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Based on MediSentry's async email implementation, we fire and forget the email
const sendAsyncEmail = (subject, to, htmlMessage) => {
    const mailOptions = {
        from: `Road Damage AI <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlMessage
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`[EMAIL ERROR] ${error}`);
        } else {
            console.log(`[EMAIL THREAD] Sent to [${to}]`);
        }
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            otp_code: otp,
            is_verified: false,
            role: 'public' // Explicitly set public for new signups
        });

        await newUser.save();

        const subject = 'Verify your Road Damage AI Account';
        
        const htmlMessage = `
        <html>
            <body style="font-family: 'Inter', sans-serif; background-color: #f0f2f5; padding: 40px 0; margin: 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <table width="400" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                                <tr>
                                    <td align="center" style="padding: 40px; background-color: #1a73e8;">
                                        <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">Road Damage AI</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 40px 30px;">
                                        <h2 style="color: #1c1e21; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">Verify your identity</h2>
                                        <p style="color: #65676b; font-size: 16px; line-height: 24px; margin: 0 0 35px 0;">
                                            Use the verification code below to complete your registration.
                                        </p>
                                        <table border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border: 2px solid #e1e4e8; border-radius: 12px;">
                                            <tr>
                                                <td align="center" style="padding: 20px 40px;">
                                                    <span style="font-size: 48px; font-weight: 800; color: #1a73e8; letter-spacing: 15px; font-family: 'Courier New', monospace; line-height: 1;">${otp}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
        `;

        sendAsyncEmail(subject, email, htmlMessage);
        res.status(201).json({ message: 'User registered. Please check email for verification code.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.otp_code === String(otp).trim()) {
            user.is_verified = true;
            user.otp_code = null;
            await user.save();
            return res.status(200).json({ message: 'Email verified successfully!' });
        } else {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Find by email OR username (to support ADMIN/corporation login)
        const user = await User.findOne({ 
            $or: [
                { email: email || '___INVALID___' }, 
                { username: username || email || '___INVALID___' }
            ] 
        });

        if (!user) {
            return res.status(400).json({ error: 'User account not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password.' });
        }

        // Static users (Admin/Corp) are pre-verified. Others must verify.
        if (user.role === 'public' && !user.is_verified) {
            return res.status(400).json({ error: 'Account not verified.' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user_profile: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email, 
                        role: user.role 
                    } 
                });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
