const express = require('express');
const cartRouter = express.Router();
const { database } = require('../models/database'); 
const { body, validationResult } = require('express-validator');

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
}

// Add to Cart Route
cartRouter.post('/add-to-cart', ensureAuthenticated, [
    body('productId').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('size').isString().withMessage('Size must be a string'),
    body('mainImage').isURL().withMessage('Main Image must be a valid URL'),
    body('total').isDecimal().withMessage('Total must be a decimal number'),
],async (req, res) => {
    const { productId, quantity, size, mainImage, total } = req.body;
    const userId = req.user.id; // Assuming passport is working correctly

    if (!productId || !quantity || !size) { // Ensure size is provided
        return res.status(400).json({ success: false, message: 'Invalid cart data' });
    }

    try {
        // Check if the product exists
        const productResult = await database.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }


        // Insert or update cart with additional fields, including size
        const insertQuery = `
            INSERT INTO cart (user_id, product_id, quantity, mainImage, total, size)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, product_id, size) DO UPDATE
            SET quantity = cart.quantity + $3,
                added_at = NOW(),
                mainImage = $4,
                total = $5
        `;
        await database.query(insertQuery, [userId, productId, quantity, mainImage, total, size]);

        res.status(200).json({ success: true, message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Merge Cart Route
cartRouter.post('/merge-cart', ensureAuthenticated, async (req, res) => {
    const { cart } = req.body;
    const userId = req.user.id; // Make sure to get user ID correctly

    if (!Array.isArray(cart)) {
        return res.status(400).json({ success: false, message: 'Invalid cart data' });
    }

    const client = await database.connect(); // Acquire a client from the pool

    try {
        await client.query('BEGIN');

        for (let item of cart) {
            const { productId, quantity, mainImage, total, size } = item;

            if (!productId || !quantity || !size) {
                // Skip invalid items
                continue;
            }

            // Check if the product exists
            const productResult = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length === 0) {
                continue; // Skip if product doesn't exist
            }

            // Insert or update cart with additional fields, including size
            const insertQuery = `
                INSERT INTO cart (user_id, product_id, quantity, mainImage, total, size)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, product_id, size) DO UPDATE
                SET quantity = cart.quantity + $3,
                    added_at = NOW(),
                    mainImage = $4,
                    total = $5
            `;
            await client.query(insertQuery, [userId, productId, quantity, mainImage, total, size]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Cart merged successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error merging cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        client.release(); // Release the client back to the pool
    }
});

// Get Cart Route
cartRouter.get('/my-cart', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id; // Corrected from req.session.user_id to req.user.id

    try {
        const query = `
            SELECT 
                p.id AS product_id, 
                p.product_name, 
                p.price, 
                p.image_url, 
                c.quantity, 
                c.mainImage, 
                c.total, 
                c.size, 
                (p.price * c.quantity) AS subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1
        `;
        const result = await database.query(query, [userId]);
        res.status(200).json({ success: true, cart: result.rows });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Remove from Cart Route
cartRouter.post('/remove-from-cart', ensureAuthenticated, async (req, res) => {
    const { productId, size } = req.body; 
    const userId = req.user.id; // Corrected access to user ID

    if (!productId || !size) {
        return res.status(400).json({ success: false, message: 'Product ID and size are required' });
    }

    try {
        const deleteQuery = `
            DELETE FROM cart
            WHERE user_id = $1 AND product_id = $2 AND size = $3
        `;
        await database.query(deleteQuery, [userId, productId, size]);

        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update User Info Route
cartRouter.post(
    '/update-user-info',
    ensureAuthenticated,
    // Validation and sanitization
    body('email').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').optional().matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number'),
    body('address').optional().trim().escape(),
    async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { email, phone, address } = req.body;
        const values = [];
        let query = 'UPDATE users SET ';
        let setClauses = [];

        if (email) {
            values.push(email);
            setClauses.push(`email = $${values.length}`);
        }
        if (phone) {
            values.push(phone);
            setClauses.push(`phone = $${values.length}`);
        }
        if (address) {
            values.push(address);
            setClauses.push(`address = $${values.length}`);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
        }

        query += setClauses.join(', ');
        query += ` WHERE id = $${values.length + 1} RETURNING id, username, email, phone, address, role, created_at`;
        values.push(req.user.id); // Assuming `req.user.id` holds the user's ID

        try {
            const result = await database.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const updatedUser = result.rows[0];

            res.json({ success: true, message: 'User information updated successfully', user: updatedUser });
            console.log('success')
        } catch (error) {
            console.error('Error updating user information:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);


// Route to place an order
cartRouter.post('/order', async (req, res) => {
    try {
        const { cartItems, total, user_id, username } = req.body;

        // Ensure user_id, cartItems, and username exist
        if (!user_id || !cartItems || !username || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        // Clean the numeric values by removing commas (for cases where number formatting was applied)
        const cleanedTotal = parseFloat(total.replace(/,/g, ''));

        // Format the current date as 'October 1, 2024'
        const formattedDate = new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).format(new Date());

        // Step 1: Insert order data into 'orders' table
        const orderResult = await database.query(
            `INSERT INTO orders (username, total_price, status, updated_at)
            VALUES ($1, $2, 'pending', NULL) RETURNING order_id`,
            [username, cleanedTotal]
        );

        const orderId = orderResult.rows[0].order_id; // Get the newly created order ID

        // Step 2: Insert each product from cartItems into 'order_details' table
        for (const item of cartItems) {
            const { product_name, size, price, quantity, mainimage, subtotal } = item;

            // Insert into order_details table with created_at as the formatted date
            await database.query(
                `INSERT INTO order_details (order_id, product_name, size, price, quantity, image_url, subtotal, total, created_at, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    orderId, 
                    product_name, 
                    size, 
                    parseFloat(price), 
                    parseInt(quantity), 
                    mainimage, 
                    parseFloat(subtotal), 
                    cleanedTotal, 
                    formattedDate, // Use formatted date for created_at
                    user_id
                ]
            );
        }

        // Step 3: Delete cart items for the user after successful order placement
        await database.query(
            `DELETE FROM cart WHERE user_id = $1`,
            [user_id]
        );

        // Step 4: Return a success response
        res.status(200).json({ success: true, message: 'Order placed successfully', orderId });

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




module.exports = cartRouter;
