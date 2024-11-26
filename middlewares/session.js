// middleware/session.js
require('dotenv').config();
const session = require('express-session');

const sessionMiddleware = session({
    secret: process.env.Session_secret, // Ensure this is set in your .env file
    resave: false, // Do not save session if unmodified
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
        secure: true, // Ensure HTTPS
        httpOnly: true,
        sameSite: 'lax' //adding security
    }
});

module.exports = {sessionMiddleware};
