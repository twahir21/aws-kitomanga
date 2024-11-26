const express = require('express');

const shopRouter = express.Router();
const { database } = require('../models/database');



// **Shop Route to Fetch Products**
shopRouter.get('/', async (req, res) => {
    try {
        const result = await database.query('SELECT * FROM products');
        res.render('shop/shop', {
            productLists: result.rows,
        });
    } catch (err) {
        console.log('Error fetching products: ', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = shopRouter;
