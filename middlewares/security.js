const helmet = require('helmet');
const crypto = require('crypto');

// Middleware to generate a unique nonce for each request
const nonceMiddleware = (req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64'); // Generate a random nonce
    next();
};

// Security middleware
const securityMiddleware = (req, res, next) => {
    // Set Helmet's content security policy with the nonce from res.locals
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://cdn.jsdelivr.net", // For SweetAlert2 from JSDelivr
                `'nonce-${res.locals.nonce}'`, // Apply nonce dynamically from res.locals
            ],
            styleSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com", // For Font Awesome
                "https://fonts.googleapis.com", // For Google Fonts
                "'unsafe-inline'", // Allows inline styles required by SweetAlert2
            ],
            fontSrc: [
                "'self'",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com",
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https://0l4zb3jw-3000.euw.devtunnels.ms", // Allow images from this external URL
                "http://localhost:3000", // Allow images from localhost
                "https://localhost:3000" // Also allow images over HTTPS on localhost
            ],
            connectSrc: ["'self'"],
            upgradeInsecureRequests: [],
        },
    })(req, res, next); // Call next after applying the middleware
};

// Apply helmet separately for other security measures if necessary
const otherSecurityMiddleware = helmet({
    crossOriginEmbedderPolicy: false,
    // Other helmet options can be added here
});

module.exports = { securityMiddleware, nonceMiddleware, otherSecurityMiddleware };
