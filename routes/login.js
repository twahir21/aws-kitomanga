// routes/login.js
const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const loginRouter = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const { database } = require('../models/database'); // Import your database module
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const moment = require('moment'); // To format dates




// Rate limiting middleware for POST /login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});


// **Login Page Route**
loginRouter.get('/login', (req, res) => {
    console.log('GET /login accessed');
    res.render('auth/login', { 
        errors: req.flash('error'), 
    });
});

// **Login Authentication Route**
loginRouter.post('/login', loginLimiter, [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
], (req, res, next) => {
    console.log('POST /login accessed');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).render('auth/login', { 
            errors: errors.array(),
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return next(err);
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            req.flash('error', info.message || 'Invalid username or password');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }

            // **Redirect based on user role**
            if (user.role === 'admin') {
                console.log('Redirecting to /admin/dashboard');
                return res.redirect('/admin/admin');
            } else if (user.role === 'user') {
                console.log('Redirecting to /dashboard');
                return res.redirect('/dashboard');
            } else {
                console.log('Unknown user role:', user.role);
                req.flash('error', 'User role not recognized');
                return res.redirect('/login');
            }
        });
    })(req, res, next);
});


loginRouter.get('/dashboard', ensureAuthenticated, async (req, res) => {
    console.log('GET /dashboard accessed by', req.user.username);
    
    const [cartResult, usersResult, ordersResult] = await Promise.all([
        database.query(`
            SELECT c.*, p.product_name, p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1
        `, [req.user.id]), // Filter the cart by user_id
        database.query('SELECT * FROM users WHERE id = $1', [req.user.id]),
        database.query(`
            SELECT o.order_id, o.total_price, o.status, od.created_at
            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id
            WHERE o.username = $1
        `, [req.user.username]) // Filter orders by username
    ]);
    
    const users = usersResult.rows;
    const orders = ordersResult.rows;

    // Check if the user was found
    if (users.length === 0) {
        return res.status(404).send('User not found');
    }

    // Accessing the first user in the array
    const user = users[0]; // Assuming you're only retrieving one user

    const cart = cartResult.rows;

    // Format the orders data
    const formattedOrders = orders.map(order => ({
        order_id: order.order_id,
        total_price: Math.round(order.total_price).toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        }), // Add commas and omit decimals
        created_at: moment(order.created_at).format('MMMM D, YYYY'), // Format date
        status: order.status // Include status
    }));

    res.render('auth/dashboard', { 
        user: user.username, 
        address: user.address || '1234, Main Street, Dar es Salaam', // Set default if null
        email: user.email, 
        phone: user.phone,
        user_id: user.id,
        address: user.address, 
        cart: cart,
        orders: formattedOrders // Pass formatted orders with status
    });
});



function generateUniqueRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Define the character set
    const uniqueChars = new Set(); // Use a Set to ensure uniqueness

    // Keep generating characters until we have enough unique characters
    while (uniqueChars.size < length) {
        const randomIndex = Math.floor(Math.random() * characters.length); // Get a random index
        uniqueChars.add(characters[randomIndex]); // Add the character to the Set
    }

    return Array.from(uniqueChars).join(''); // Convert the Set to an array and join it into a string
}

// In your route for generating the invoice
loginRouter.get('/download-invoice/:order_id', ensureAuthenticated, async (req, res) => {
    const { order_id } = req.params;

    // Query to check the paid status for the given order
    const orderQuery = `
        SELECT 
            od.paid, -- Check if the order has been paid
            o.total_price, 
            o.status, 
            od.created_at, 
            od.quantity, 
            p.id AS product_id, 
            p.product_name, 
            p.price
        FROM 
            orders o
        JOIN 
            order_details od ON o.order_id = od.order_id
        JOIN 
            products p ON od.product_name = p.product_name
        WHERE 
            od.user_id = $2 AND o.order_id = $1;
    `;

    try {
        const result = await database.query(orderQuery, [order_id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to access it.' });
        }

        const order = result.rows;  // The order information from the database
        const user = req.user;      // Authenticated user from request (this ensures user is defined)

        // If the order is not paid, return a 403 response with a message
        if (!order[0].paid) {
            return res.status(403).json({ message: "You have not made a purchase yet." });
        }

        // Generate a unique random key for the invoice
        const invoiceKey = generateUniqueRandomString(8);
        const currentDate = new Date().toLocaleDateString();

        // Generate the HTML content for the invoice
        const invoiceHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
                <title>Kitomanga Invoice</title>
                <style>
                    body { font-family: 'Poppins', sans-serif; margin: 0; padding: 20px; border: 1px solid #ccc; border-radius: 8px;background-color: #f9f9f9;height: 95vh;}
                    h1 { color: #D71313; text-align: center; }
                    .invoice-header { text-align: right; }
                    .customer-info, .order-info { margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                    th { background-color: #bd1010; color: #ffffff; }
                    .total { text-align: right; font-weight: bold; font-size: 1.2em; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 40px; }
                </style>
            </head>
            <body>
                <h1>Kitomanga Invoice</h1>
                <div class="invoice-header">
                    <p>Date: <strong>${currentDate}</strong></p>
                    <p>Invoice key #: <strong>${invoiceKey}</strong></p>
                </div>
                <div class="customer-info">
                    <h2>Customer Information</h2>
                    <p>Name: <strong>${user.username}</strong></p>
                    <p>Email: <strong>${user.email}</strong></p>
                    <p>Phone: <strong>${user.phone || 'N/A'}</strong></p>
                    <p>Address: <strong>${user.address || '123 Main Street, Dar es Salaam, TZ'}</strong></p>
                </div>
                <div class="order-info">
                    <h2>Order Information</h2>
                    <p>Order ID: <strong>#${order_id}</strong></p>
                    <p>Date: <strong>${new Date(order[0].created_at).toLocaleDateString()}</strong></p>
                </div>
                <h2>Items</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>TZS ${Number(item.price.replace(/[^0-9.-]+/g, "")).toLocaleString()}</td>
                                <td>TZS ${(Number(item.price.replace(/[^0-9.-]+/g, "")) * Number(item.quantity)).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">
                    Total: <strong>TZS ${Math.round(order[0].total_price).toLocaleString()}/=</strong>
                </div>
                <div class="footer">
                    <p>Thank you for your purchase!</p>
                </div>
            </body>
            </html>
        `;

        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });


        // Save PDF with the unique invoice key in the public directory
        const filePath = path.join(__dirname, `../public/pdf/${invoiceKey}.pdf`);

        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '10mm', bottom: '20mm', left: '10mm' }
        });

        await browser.close();

        // Send the PDF to the user
        res.download(filePath, `${invoiceKey}.pdf`, (err) => {
            if (err) {
                console.error('Error downloading invoice:', err);
            }
        });
    } catch (error) {
        console.error('Error handling invoice request:', error);
        res.status(500).json({ message: 'Error processing request.' });
    }
});


// **Export the Router**
module.exports = loginRouter;
