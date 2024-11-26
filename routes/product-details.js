const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAdmin } = require('../middlewares/auth'); // Assuming you have this middleware
const {database} = require('../models/database');


// Set up Multer storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Save to the 'public/uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Multer configuration for handling multiple files (images and video)
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
}).fields([
    { name: 'images', maxCount: 7 }, // Up to 7 image files
    { name: 'video_url', maxCount: 1 } // Optional video file
]);

// Multer configuration for editing a product (single image)
const uploadEdit = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
}).single('image'); // Only handle a single file named 'image'


// POST route to add product details
router.post('/add-product-details', ensureAdmin, upload, async (req, res) => {
    const { product_id, description } = req.body;

    // Handle file uploads (images and video)
    let image_urls = [];
    if (req.files['images']) {
        image_urls = req.files['images'].map(file => `/uploads/${file.filename}`);
    }

    let video_url = null;
    if (req.files['video_url'] && req.files['video_url'][0]) {
        video_url = `/uploads/${req.files['video_url'][0].filename}`;
    }

    try {
        // Insert data into product_details table
        await database.query(
            `INSERT INTO product_details (product_id, description, video, images, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [product_id, description, video_url, image_urls]
        );

        req.flash('success_msg', 'Product details added successfully.');
        res.redirect('/admin/admin');
    } catch (error) {
        console.error('Error adding product details:', error);
        req.flash('error_msg', 'Failed to add product details. Please try again.');
        res.redirect('/admin/admin');
    }
});

// Route: GET /admin/edit-product/:id - Show edit product form
router.get('/edit-product/:id', ensureAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await database.query('SELECT * FROM products WHERE id = $1', [id]);
        const product = result.rows[0];

        if (!product) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/admin/admin');
        }

        res.render('admin/editProduct', { 
            product,
            user: req.user.username
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// POST route to update an existing product
router.post('/edit-product/:id', ensureAdmin, uploadEdit, async (req, res) => {
    const { id } = req.params; // The product's ID to update
    const { product_id, product_name, brand, price, price_deleted, rating, existing_image_url } = req.body;
    
    // Logging received data for debugging
    console.log('Received Body:', req.body);
    console.log('Received File:', req.file);
    
    let image_url = existing_image_url; // Retain existing image URL by default

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`; // Update with new image URL if a new image is uploaded
    }

    try {
        // Update the product in the database
        await database.query(
            `UPDATE products 
             SET id = $1, product_name = $2, brand = $3, price = $4, price_deleted = $5, rating = $6, image_url = $7, updated_at = NOW()
             WHERE id = $8`,
            [product_id, product_name, brand, price, price_deleted, rating, image_url, id]
        );

        req.flash('success_msg', 'Product updated successfully.');
        res.redirect('/admin/admin'); 
    } catch (error) {
        console.error('Error updating product:', error);
        req.flash('error_msg', 'Failed to update product. Please try again.');

        try {
            // Fetch the product details again to re-render the form
            const result = await database.query('SELECT * FROM products WHERE id = $1', [id]);
            const product = result.rows[0];

            if (!product) {
                req.flash('error_msg', 'Product not found.');
                return res.redirect('/admin/admin');
            }

            res.render('admin/editProduct', { 
                product,
                user: req.user.username,
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg')
            });
        } catch (err) {
            console.error('Error fetching product for re-render:', err);
            res.status(500).send('Server Error');
        }
    }
});



// routes/admin.js
router.get('/delete-product/:id', ensureAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the product details based on the provided product ID
        const product = await database.query('SELECT * FROM products WHERE id = $1', [id]);

        if (product.rows.length === 0) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/admin/admin');
        }

        // Render the delete product page, passing the product data to the view
        res.render('admin/delete', {
            product: product.rows[0], // Passing product details
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        req.flash('error_msg', 'Failed to load product details.');
        res.redirect('/admin/admin');
    }
});



// Route: POST /admin/delete-product/:id - Delete a product
router.post('/delete-product/:id', ensureAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        await database.query('DELETE FROM products WHERE id = $1', [id]);
        req.flash('success_msg', 'Product deleted successfully.');
        res.redirect('/admin/admin'); 
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to delete product. Please try again.');
        res.redirect('/admin/admin');
    }
});

router.get('/product-details/:id', ensureAdmin, async (req, res) => {
    const id = parseInt(req.params.id); // Convert to integer
    
    try {
        const result = await database.query(
            `SELECT * FROM product_details
             WHERE product_id = $1`, 
            [id]
        );
        const product = result.rows[0];

        if (!product) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/admin/admin');
        }

        res.render('admin/editDetails', { 
            product,
            user: req.user.username
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
