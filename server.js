const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression'); // Optional if using compression
const dotenv = require('dotenv');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

dotenv.config();

// Import Middlewares
const { sessionMiddleware } = require('./middlewares/session');
const { limiter } = require('./middlewares/rateLimit');
const { securityMiddleware, nonceMiddleware } = require('./middlewares/security');
const { passport } = require('./middlewares/passport');

// Import Routes
const shopRouter = require('./routes/shop');
const addProductRouter = require('./routes/add-products');
const loginRoute = require('./routes/login');
const productDetailsRouter = require('./routes/product-details');
const publicRouter = require('./routes/public');
const displayDetailsRouter = require('./routes/displayDetails');
const emailRouter = require('./routes/email');
const signupRouter = require('./routes/signup');
const resetRouter = require('./routes/reset');
const admin = require('./routes/adminRoute');
const logoutRouter = require('./routes/logout');
const cartRouter = require('./routes/cart');
const updateDetails = require('./routes/updateDetails');
const salesGraph = require('./routes/salesGraph');
const viewPdf = require('./routes/pdf');

// Initialize Express App
const app = express();

// Middleware Setup
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Make Flash Messages Available in All Templates
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(nonceMiddleware);
app.use(securityMiddleware);
app.use(limiter);

app.use(compression());

// Set Templating Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database Connection
const { database } = require('./models/database');

// Routes Setup

// Admin routes
app.use('/admin', addProductRouter);
app.use('/admin', productDetailsRouter);
app.use('/admin', updateDetails);
app.use('/admin', admin);
app.use(salesGraph);
app.use('/admin', viewPdf);

// Auth routes 
app.use(loginRoute);
app.use(signupRouter);
app.use(resetRouter);
app.use(cartRouter);

// Public routes
app.use(shopRouter);
app.use(emailRouter);
app.use(displayDetailsRouter);
app.use(logoutRouter);

app.get('/view-invoice', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invoice-viewer.html')); // Adjust the path as needed
});
app.use(publicRouter);

app.set('trust proxy', 1); // Trust the first proxy

// Graceful Shutdown (to handle nice closing of database)
const shutdown = async () => {
    console.log('Closing database connection pool...');
    await database.end();
    console.log('Database connection pool closed.');
    process.exit(0);
};

process.on('SIGINT', shutdown); // Handle Ctrl+C
process.on('SIGTERM', shutdown); // Handle termination signal

// Start the HTTP server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
});
