require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { database } = require('../models/database');

const emailRouter = express.Router();

// Middleware
emailRouter.use(express.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER, // Your sending email
        pass: process.env.EMAIL_PASS // Email password
    }
});

// Verify the transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error with email transporter:', error);
    } else {
        console.log('Email transporter is ready');
    }
});

// POST /send-mail Route with Validation and Sanitization
emailRouter.post('/send-mail', [
    // Validation and Sanitization
    body('name')
        .trim()
        .matches(/^(?!.*[-_]{2})(?!.*[ \-_]{2})[a-zA-Z0-9][a-zA-Z0-9-_ ]{2,15}[a-zA-Z0-9]$/)
        .withMessage('Invalid name format.'),
    // Removed email validation as per your request
    body('phone')
        .matches(/^\+?(971|255|254|256|86)?[1-9][0-9]{8}$/)
        .withMessage('Invalid phone number.'),
    body('message')
        .trim()
        .isLength({ min: 1, max: 250 })
        .withMessage('Message must be between 1 and 250 words.')
], (req, res) => {
    // Handle Validation Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, errors: errors.array() });
    }

    const { name, email, phone, message } = req.body;

    // Define Email Options (Email always sent to fixed recipient)
    const mailOptions = {
        from: email, // Use the sender's email as provided in the form
        to: process.env.RECIPIENT_EMAIL, // Fixed recipient email from .env
        subject: `New Message from ${name}`,
        text: `You have received a new message from your website contact form.\n\n` +
              `Here are the details:\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Phone: ${phone}\n\n` +
              `Message:\n${message}`,
        replyTo: email // Allows you to reply directly to the sender's email
    };

    // Send Email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ status: 500, message: 'Error sending email. Please try again later.' });
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ status: 200, message: 'Email sent successfully!' });
    });
});

// POST /validate-contact Route
emailRouter.post('/validate-contact', async (req, res) => {
    const { email, name, phone } = req.body;

    try {
        // Check if all three fields (email, username, and phone) exist in the database
        const query = `
            SELECT * FROM users 
            WHERE email = $1 AND username = $2 AND phone = $3;
        `;
        const values = [email, name, phone];
        const result = await database.query(query, values);

        if (result.rows.length === 0) {
            // If none of the entries exist, return an error
            return res.status(400).json({
                error: true,
                message: 'Email, username, or phone not found in the database.'
            });
        }

        // If validation is successful, allow the user to proceed with the contact form
        return res.status(200).json({
            error: false,
            message: 'Validation successful.'
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: true, message: 'Server error' });
    }
});

// Global Error Handler
emailRouter.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ status: 500, message: 'An unexpected error occurred.' });
});

module.exports = emailRouter;
