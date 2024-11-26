const express = require('express');
const resetRouter = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { database } = require('../models/database');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER, // Your sending email
        pass: process.env.EMAIL_PASS // Email password
    }
});

// **Forget Password Route (GET)**
resetRouter.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', { errors: [] });  // Pass CSRF token here
});

// **Forget Password Route (POST)**
resetRouter.post('/forgot-password', [
    body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/forgot-password', {
            errors: errors.array(),
        });
    }

    const { email } = req.body;

    try {
        const userResult = await database.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).render('auth/forgot-password', {
                errors: [{ msg: 'No user found with this email.' }],
            });
        }

        const user = userResult.rows[0];

        // Generate a password reset token (you can use crypto to create a secure token)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save the token and its expiration (e.g., 1 hour)
        await database.query(
            `UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE email = $2`,
            [resetToken, email]
        );

        // Send the password reset link via email
        const resetLink = `https://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `Hello ${user.username},\n\nYou requested a password reset. Please click the link below to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending reset password email:', error);
                return res.status(500).render('auth/forgot-password', {
                    errors: [{ msg: 'Error sending reset password email.' }],
                });
            }

            req.flash('success_msg', 'Reset link has been sent to your email.');
            res.redirect('/login');
        });

    } catch (err) {
        console.error('Error during forgot password request:', err.stack);
        res.status(500).render('auth/forgot-password', {
            errors: [{ msg: 'An error occurred while processing your request.' }],
        });
    }
});

// **Reset Password Route (GET)**
resetRouter.get('/reset-password', (req, res) => {
    const { token, email } = req.query;
    if (!token || !email) {
        return res.status(400).send('Invalid token or email.');
    }
    res.render('auth/reset-password', { token, email, errors: [] });  // Pass CSRF token here
});

// **Reset Password Route (POST)**
resetRouter.post('/reset-password', [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/reset-password', {
            errors: errors.array(),
            token: req.body.token,
            email: req.body.email,
        });
    }

    const { password, token, email } = req.body;

    try {
        const userResult = await database.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).render('auth/reset-password', {
                errors: [{ msg: 'No user found with this email.' }],
                token,
                email,
            });
        }

        const user = userResult.rows[0];

        // Check if the reset token is valid and not expired
        if (user.reset_token !== token || new Date() > user.reset_token_expires) {
            return res.status(400).render('auth/reset-password', {
                errors: [{ msg: 'Invalid or expired token.' }],
                token,
                email,
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update the user's password and clear the reset token
        await database.query(
            `UPDATE users SET pswd = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2`,
            [hashedPassword, email]
        );

        req.flash('success_msg', 'Your password has been reset successfully.');
        res.redirect('/login');

    } catch (err) {
        console.error('Error during password reset:', err.stack);
        res.status(500).render('auth/reset-password', {
            errors: [{ msg: 'An error occurred while resetting your password.' }],
            token,
            email,
        });
    }
});

module.exports = resetRouter;
