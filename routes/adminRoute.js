const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middlewares/auth');
const { database } = require('../models/database'); // Import your database module
const path = require('path'); // Add this line
const fs = require('fs');

// **Admin Dashboard Route**
router.get('/admin', ensureAdmin, async (req, res, next) => {
    console.log('GET /admin/dashboard accessed by', req.user.username);
    try {
        const [productsResult, usersResult, ordersResult, orderDetailsResult, totalPendingResult, totalSales] = await Promise.all([
            // Fetch all products
            database.query('SELECT * FROM products'),

            // Fetch all users
            database.query('SELECT * FROM users'),

            // Join orders with order_details to fetch recent orders including paid and updated_at
            database.query(`
            SELECT o.order_id, o.username, o.status, o.updated_at, o.total_price, 
                   MIN(od.created_at) AS created_at, 
                   bool_or(od.paid) AS paid -- Aggregate to get paid status across details
            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id
            GROUP BY o.order_id, o.username, o.status, o.updated_at, o.total_price
            ORDER BY MIN(od.created_at) DESC
            `),

            // Fetch all order details
            database.query('SELECT * FROM order_details'),

            // Fetch count of pending orders
            database.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'"),

            // Fetch total sales of completed and paid orders
            database.query(`
                SELECT SUM(total_order_price) AS total_price_sum 
                FROM (
                    SELECT DISTINCT o.order_id, o.total_price AS total_order_price
                    FROM orders o 
                    JOIN order_details od ON o.order_id = od.order_id 
                    WHERE od.paid = true
                ) AS distinct_orders;
            `)
        ]);

        // Extract and process results
        const pendingOrdersCount = totalPendingResult.rows[0].count;
        const products = productsResult.rows;
        const users = usersResult.rows;
        const verifiedUsersCount = users.filter(user => user.is_verified).length;
        const orders = ordersResult.rows; // Contains joined data (order_id, username, status, total_price, created_at, updated_at, paid)
        const order_details = orderDetailsResult.rows; // Fetch all order details
        const totalOrders = orders.length;
        const allSales = totalSales.rows[0].total_price_sum || 0;

        // Render the admin dashboard with all the data
        res.render('admin/admin', { 
            users: users,
            products: products, 
            verifiedUsersCount: verifiedUsersCount,
            orders: orders,  // This includes recent orders
            order_details: order_details, // Pass order_details to the view
            totalOrders: totalOrders,
            pendingOrdersCount: pendingOrdersCount,
            allSales: allSales,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        next(error); // Pass the error to the error-handling middleware
    }
});




// **Delete User Route**
router.delete('/delete-user/:id', ensureAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        // Start a transaction
        const client = await database.connect();
        await client.query('BEGIN');

        // Delete related data (e.g., orders) for the user
        await client.query('DELETE FROM order_details WHERE user_id = $1', [userId]);

        // Delete the user from the users table
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

        // If no user is found, return a 404 error
        if (result.rowCount === 0) {
            await client.query('ROLLBACK'); // Roll back transaction if no user is found
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Commit the transaction if everything goes well
        await client.query('COMMIT');

        // Release the database client
        client.release();

        // Return success response
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        await client.query('ROLLBACK'); // Roll back the transaction on error
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.post('/update-order', async (req, res) => {
    const { order_id, status, paid } = req.body;
    console.log(order_id, status, paid);

    if (!order_id || !status || paid === undefined) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Update the status in the orders table for the specific order_id
        const updateOrderResult = await database.query(`
            UPDATE orders
            SET status = $1, updated_at = NOW()
            WHERE order_id = $2
            RETURNING *;`, [status, order_id]);

        // Update the paid status in the order_details table for the specific order_id
        await database.query(`
            UPDATE order_details
            SET paid = $1
            WHERE order_id = $2;`, [paid, order_id]);

        res.json({ message: "Order updated successfully!", updatedOrder: updateOrderResult.rows });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: "Failed to update the order." });
    }
});

// Assuming you're using Express
router.delete('/delete-unused-orders', ensureAdmin, async (req, res) => {
    try {
        // Query to delete order_details first
        const deletedDetailsResult = await database.query(
            `DELETE FROM order_details WHERE order_id IN (
                SELECT order_id FROM orders WHERE status IN ('Cancelled', 'Delivered')
            )`
        );

        // Now delete the orders
        const deletedOrdersResult = await database.query(
            `DELETE FROM orders WHERE status IN ('Cancelled', 'Delivered')`
        );

        res.json({
            message: 'Unused orders and their details deleted successfully',
            detailsDeletedCount: deletedDetailsResult.rowCount,
            ordersDeletedCount: deletedOrdersResult.rowCount
        });
    } catch (error) {
        console.error('Error deleting unused orders:', error);
        res.status(500).json({ message: 'An error occurred while deleting unused orders.' });
    }
});

router.get('/view-pdf', ensureAdmin, (req, res) => {
    res.render('admin/view-pdf');
});

router.get('/view-pdf/:invoiceKey', ensureAdmin, (req, res) => {
    const invoiceKey = req.params.invoiceKey;

    // Define the path to the PDF directory (in the main project directory)
    const pdfPath = path.join(__dirname, '../public/pdf', `${invoiceKey}.pdf`);

    // Check if the file exists
    fs.access(pdfPath, fs.constants.F_OK, (err) => {
        if (err) {
            // If the file doesn't exist, send a 404 error
            res.status(404).json({ message: 'PDF not found' });
        } else {
            // If the file exists, serve it
            res.sendFile(pdfPath);
        }
    });
});


module.exports = router;
