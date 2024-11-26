const express = require('express');
const multer = require('multer');
const path = require('path');

const addProductRouter = express.Router();

// Database connection
const { database } = require('../models/database');

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

// Create multer instance
const upload = multer({ storage: storage });



// Render the add product page with CSRF token
addProductRouter.get('/add-product', (req, res) => {
    res.render('admin/addProduct'); // Pass CSRF token to the template
});

// Handle product submission
addProductRouter.post('/handle-products', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const product_name = req.body.product_name;
    const brand = req.body.brand;
    const price = req.body.price;
    const price_deleted = req.body.price_deleted;
    const categories = req.body.categories;
    const rating = req.body.rating;
    const imageUrl = `/uploads/${req.file.filename}`; 

    const dbArray = [product_name, price, price_deleted, rating, imageUrl, brand, categories];

    database.query(
        'INSERT INTO products (product_name, price, price_deleted, rating, image_url, brand, categories) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        dbArray,
        (err) => {
            if (err) {
                console.log('Error inserting product: ', err.stack);
                return res.status(500).send('<h2>Error saving product</h2>');
            }
            res.redirect('/'); 
        }
    );

    console.log('Product saved successfully!');
});

// Export the router
module.exports = addProductRouter;
