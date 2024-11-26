const express = require('express');
const displayDetailsRouter = express.Router();
const { database } = require('../models/database');

// Route to fetch product details by product ID from the URL
displayDetailsRouter.get('/product-details/:productId', async (req, res) => {
    const productId = req.params.productId; // Extract productId from the URL

    try {
        // Query to join product_details and products tables using product_id
        const query = `
            SELECT pd.*, p.product_name, p.price, p.price_deleted, p.brand 
            FROM product_details pd
            JOIN products p ON pd.product_id = p.id
            WHERE pd.product_id = $1
        `;
        const values = [productId];

        const result = await database.query(query, values);

        // Check if the product exists
        if (result.rows.length > 0) {
            res.render('shop/product-details', { 
                productDetails: result.rows[0], // Pass all product details and related data
            });
        } else {
            res.status(404).render('shop/product-not-found');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Error fetching product details');
    }
});

module.exports = displayDetailsRouter;
