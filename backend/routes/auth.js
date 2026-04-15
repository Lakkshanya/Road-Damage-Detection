const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a user and send OTP
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/verify
// @desc    Verify OTP for a user
// @access  Public
router.post('/verify', authController.verifyEmail);

// @route   POST /api/auth/login
// @desc    Login and get JWT token
// @access  Public
router.post('/login', authController.login);

module.exports = router;
