const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create nodemailer transporter config (You will need to fill in real SMTP info in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard setup
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

        // Generate 6-digit OTP (matching MediSentry Python's random.randint(100000, 999999))
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            otp_code: otp,
            is_verified: false
        });

        await newUser.save();

        const subject = 'Verify your Road Damage AI Account';
        
        // Exact reference layout from MediSentry with generic colors
        const htmlMessage = `
        <html>
            <body style="font-family: 'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, helvetica, arial, sans-serif; background-color: #f0f2f5; padding: 40px 0; margin: 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <table width="400" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                                <tr>
                                    <td align="center" style="padding: 40px; background-color: #1a73e8;">
                                        <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">Road Damage<span style="color: #8ab4f8;"> AI</span></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 40px 30px;">
                                        <h2 style="color: #1c1e21; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">Verify your identity</h2>
                                        <p style="color: #65676b; font-size: 16px; line-height: 24px; margin: 0 0 35px 0;">
                                            Your security is our priority. Please use the verification code below to complete your registration.
                                        </p>
                                        
                                        <table border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border: 2px solid #e1e4e8; border-radius: 12px;">
                                            <tr>
                                                <td align="center" style="padding: 20px 40px;">
                                                    <span style="font-size: 48px; font-weight: 800; color: #1a73e8; letter-spacing: 15px; font-family: 'Courier New', monospace; line-height: 1;">${otp}</span>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="color: #8a8d91; font-size: 13px; margin: 35px 0 0 0;">
                                            This code expires in 10 minutes. If you didn't request this, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #f8f9fa; border-top: 1px solid #e1e4e8;">
                                        <p style="color: #bcc0c4; font-size: 11px; margin: 0;">&copy; 2026 Road Damage AI</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
        `;

        // Send Email asynchronously
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
        console.log(`[OTC VERIFY DEBUG Start]`);
        console.log(` - Request Email: '${email}'`);
        console.log(` - Request OTP:   '${otp}'`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log(` [FAILURE] User not found for email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(` - Found User:    ${user.username}`);
        console.log(` - Stored OTP:    '${user.otp_code}'`);
        console.log(` - Is Verified:   ${user.is_verified}`);

        const storedOtp = user.otp_code ? String(user.otp_code).trim() : null;
        const incomingOtp = String(otp).trim();

        if (storedOtp === incomingOtp && incomingOtp !== "") {
            console.log(` [SUCCESS] OTP Matched!`);
            user.is_verified = true;
            user.otp_code = null;
            await user.save();

            // Send success email referencing MediSentry
            const subject = 'Welcome to Road Damage AI!';
            const successHtml = `
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h1 style="color: #2e7d32; text-align: center; margin-bottom: 20px;">Verification Successful</h1>
                        <p style="font-size: 16px; color: #333; text-align: center;">Your email has been verified.</p>
                        <p style="font-size: 14px; color: #555; text-align: center;">You can now log in to access the Dashboard.</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="#" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Web App</a>
                        </div>
                    </div>
                </body>
            </html>
            `;
            sendAsyncEmail(subject, email, successHtml);

            return res.status(200).json({ message: 'Email verified successfully! Login to continue.' });
        } else {
            console.log(` [FAILURE] OTP Mismatch! '${storedOtp}' != '${incomingOtp}'`);
            return res.status(400).json({ error: `Invalid OTP. Sent: ${otp}, Expected: ${storedOtp}` });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during verification.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User account not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password.' });
        }

        if (!user.is_verified) {
            return res.status(400).json({ error: 'Account not verified. Please verify your email first.' });
        }

        const payload = { user: { id: user.id } };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user_profile: { id: user.id, username: user.username, email: user.email } });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
