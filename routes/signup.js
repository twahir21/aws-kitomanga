const express = require('express');
const signupRouter = express.Router();

const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { database } = require('../models/database');
const nodemailer = require('nodemailer');


// **Configure Email Transporter**
const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., Gmail, Yahoo, etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
});


// **User Registration Route**
signupRouter.post('/signup', [
    // **Validation Middleware**
    body('usernameSignup')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .trim()
        .escape(),
    body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('phone')
        .isMobilePhone()
        .withMessage('Invalid phone number'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
], async (req, res) => {

    // **Handle Validation Errors**
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array());
        // Render the signup page with error messages
        return res.status(400).render('auth/login', { 
            errors: errors.array(), 
            usernameSignup: req.body.usernameSignup, 
            email: req.body.email, 
            phone: req.body.phone,
        });
    }

    const { usernameSignup, email, phone, password: pswd } = req.body;


    try {
        // **Check If User Already Exists by Email, Username, or Phone**
        const checkResult = await database.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2 OR phone = $3',
            [email, usernameSignup, phone]
        );

        if (checkResult.rows.length > 0) {
            const existingUser = checkResult.rows[0];
            let errorMsg = '';

            if (existingUser.email === email) {
                errorMsg = 'A user with this email already exists.';
            } else if (existingUser.username === usernameSignup) {
                errorMsg = 'A user with this username already exists.';
            } else if (existingUser.phone === phone) {
                errorMsg = 'A user with this phone number already exists.';
            }

            console.log('User already exists:', errorMsg);
            return res.status(400).render('auth/login', { 
                errors: [{ msg: errorMsg }],
                usernameSignup, 
                email, 
                phone,
            });
        }

        // **Hash the Password**
        const hashed_pswd = await bcrypt.hash(pswd, 12);
        console.log('Password hashed successfully.');

        // **Generate a 6-Digit OTP**
        const otp = crypto.randomInt(100000, 999999).toString();
        console.log('Generated OTP:', otp);

        // **Insert New User into Database with OTP Details**
        const register = await database.query(
            `INSERT INTO users (username, email, phone, pswd, role, created_at, otp, otp_created_at)
             VALUES ($1, $2, $3, $4, 'user', CURRENT_DATE, $5, NOW())
             RETURNING *`,
            [usernameSignup, email, phone, hashed_pswd, otp]
        );
        console.log('Successfully registered a user with hashed password and OTP.');

        const user = register.rows[0];
        console.log('Registered User:', user.id, user.role, user.created_at);

        // **Send OTP via Email**
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code for Kitomanga',
            text: `Hello ${usernameSignup},\n\nYour OTP code is: ${otp}\n\nPlease enter this code to verify your account.\n\nThank you!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending OTP email:', error);
                return res.status(500).render('auth/signup', { 
                    errors: [{ msg: 'Error sending OTP email.' }], 
                    usernameSignup, 
                    email, 
                    phone,
                });
            } else {
                console.log('OTP email sent:', info.response);
                // **Redirect to OTP Verification Page**
                req.flash('success_msg', 'OTP has been sent to your email.');
                res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
            }
        });

    } catch (err) {
        console.error('Database query execution failure:', err.stack);
        res.status(500).render('auth/login', { 
            errors: [{ msg: 'An error occurred while processing your request.' }],
            usernameSignup, 
            email, 
            phone,
        });
    }
});

// **OTP Verification Route (GET) - Render OTP Form**
signupRouter.get('/verify-otp', (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).send('Email is required for OTP verification.');
    }
    res.render('auth/verify-otp', { 
        email, 
        errors: [], 
    });
});

// **OTP Verification Route (POST) - Handle OTP Submission**
signupRouter.post('/verify-otp', [
    // **Validation Middleware**
    body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits.')
        .isNumeric()
        .withMessage('OTP must be numeric.')
], async (req, res) => {
    // **Log Incoming Request for Debugging**
    console.log('OTP Verification Request Body:', req.body);

    // **Handle Validation Errors**
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('OTP Verification Validation Errors:', errors.array());
        // Render the OTP form with error messages
        return res.status(400).render('auth/verify-otp', { 
            email: req.body.email,
            errors: errors.array(),
        });
    }

    const { email, otp } = req.body;

    try {
        // **Retrieve User with the Provided Email**
        const userResult = await database.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).render('auth/verify-otp', { 
                email,
                errors: [{ msg: 'No user found with this email.' }],
            });
        }

        const user = userResult.rows[0];

        // **Check if User is Already Verified**
        if (user.is_verified) {
            return res.redirect('/dashboard');
        }

        // **Check if OTP Matches and is Not Expired (e.g., valid for 10 minutes)**
        const otpAge = (Date.now() - new Date(user.otp_created_at)) / (1000 * 60); // in minutes

        if (user.otp === otp && otpAge <= 10) { // Assuming OTP is valid for 10 minutes
            // **Update User as Verified and Remove OTP Fields**
            await database.query(
                `UPDATE users
                 SET is_verified = TRUE,
                     otp = NULL,
                     otp_created_at = NULL
                 WHERE email = $1`,
                [email]
            );

            // **Log the User In**
            req.login(user, (err) => {
                if (err) {
                    console.log('Error logging in the user after OTP verification:', err);
                    return res.status(500).send('Error logging in the user.');
                }
                req.flash('success_msg', 'Your account has been verified and you are now logged in.');
                res.redirect('/dashboard'); // Redirect to the dashboard after successful verification
            });
        } else {
            return res.status(400).render('auth/verify-otp', { 
                email,
                errors: [{ msg: 'Invalid or expired OTP. Please request a new OTP.' }],
            });
        }
    } catch (err) {
        console.error('Error during OTP verification:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Resend OTP Route (POST)
signupRouter.post('/resend-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).render('auth/verify-otp', {
            email,
            errors: [{ msg: 'Email is required for OTP resend.' }],
        });
    }

    try {
        // Retrieve user
        const userResult = await database.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).render('auth/verify-otp', {
                email,
                errors: [{ msg: 'No user found with this email.' }],
            });
        }

        const user = userResult.rows[0];

        // Check resend limits (e.g., max 3 resends per hour)
        const now = new Date();
        const resendTime = new Date(user.resend_time);
        const timeDiff = (now - resendTime) / (1000 * 60 * 60); // Difference in hours

        if (timeDiff < 1 && user.resend_count >= 3) {
            return res.status(429).render('auth/verify-otp', {
                email,
                errors: [{ msg: 'You have reached the maximum number of OTP resends. Please try again later.' }],
            });
        }

        // Generate new OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        console.log('Generated OTP for resend:', otp);

        // Reset resend_count if more than an hour has passed
        let resendCount = user.resend_count;
        if (timeDiff >= 1) {
            resendCount = 0;
        }

        // Update user with new OTP and resend details
        await database.query(
            `UPDATE users
             SET otp = $1, otp_created_at = NOW(), resend_count = $2, resend_time = NOW()
             WHERE email = $3`,
            [otp, resendCount + 1, email]
        );

        // Send new OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your New OTP Code for Kitomanga',
            text: `Hello,\n\nYour new OTP code is: ${otp}\n\nPlease enter this code to verify your account.\n\nThank you!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending new OTP email:', error);
                return res.status(500).render('auth/verify-otp', {
                    email,
                    errors: [{ msg: 'Error sending new OTP email.' }],
                });
            } else {
                console.log('New OTP email sent:', info.response);
                req.flash('success_msg', 'A new OTP has been sent to your email.');
                res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
            }
        });
    } catch (err) {
        console.error('Error during OTP resend:', err.stack);
        res.status(500).render('auth/verify-otp', {
            email,
            errors: [{ msg: 'An error occurred while processing your request.' }],
        });
    }
});

module.exports = signupRouter;
