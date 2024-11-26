const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { database } = require('../models/database');
const { ensureAdmin } = require('../middlewares/auth');


// Function to update sales amount
const updateSales = async () => {
    try {
        const result = await database.query(`
        SELECT SUM(total_order_price) AS total_sales
        FROM (
            SELECT DISTINCT o.order_id, o.total_price AS total_order_price
            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id
            WHERE od.created_at >= NOW() - INTERVAL '1 day'
            AND od.paid = true
        ) AS distinct_orders;

        `);

        const totalSales = result.rows[0].total_sales || 0;
        console.log("Total Sales Query Result:", result.rows);
        console.log(`Total sales fetched: ${totalSales}`);



        // Get the current day of the week (e.g., 'Monday', 'Tuesday', etc.)
        const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });

        // Update the sales amount in the table
        await database.query(`
            UPDATE weekly_sales
            SET sales_amount = $1
            WHERE day_of_week = $2;
        `, [totalSales, currentDay]);

        console.log(`Sales amount updated for ${currentDay}: ${totalSales}`);
    } catch (error) {
        console.error('Error updating sales:', error);
    }
};

// Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', () => {
    updateSales();
});


router.get('/api/sales-data', ensureAdmin, async (req, res) => {
    try {
        const result = await database.query(`
        SELECT day_of_week, sales_amount
        FROM weekly_sales
        ORDER BY CASE 
            WHEN day_of_week = 'Monday' THEN 1
            WHEN day_of_week = 'Tuesday' THEN 2
            WHEN day_of_week = 'Wednesday' THEN 3
            WHEN day_of_week = 'Thursday' THEN 4
            WHEN day_of_week = 'Friday' THEN 5
            WHEN day_of_week = 'Saturday' THEN 6
            WHEN day_of_week = 'Sunday' THEN 7
            ELSE 8
        END;
        `);

        const labels = result.rows.map(row => row.day_of_week);
        const data = result.rows.map(row => parseFloat(row.sales_amount));

        res.json({ labels, data });
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Failed to fetch sales data' });
    }
});

// Export the router
module.exports = router;
