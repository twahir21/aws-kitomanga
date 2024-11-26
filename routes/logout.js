// routes/logout.js
const express = require('express');
const logoutRouter = express.Router();



// Ensure you pass 'next' to the route handler
logoutRouter.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Call the next middleware with the error
        }
        req.flash('success_msg', 'You have been logged out.');
        res.redirect('/login');
    });
});

// **Middleware to add CSRF token to the logout page**
logoutRouter.get('/logout', (req, res) => {
    res.render('logout');  // Ensure to render a view if needed
});

module.exports = logoutRouter;
