const express = require('express');
const multer = require('multer');
const path = require('path');

const updateProductRouter = express.Router();
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

// Handle product update
updateProductRouter.post('/update-product-details/:id', upload.fields([{ name: 'video_url', maxCount: 1 }, { name: 'images', maxCount: 7 }]), async (req, res) => {
    const productId = parseInt(req.params.id);
    const { description } = req.body; // Destructure other fields as needed

    // Handle video and images if uploaded
    let videoUrl = req.files.video_url ? `/uploads/${req.files.video_url[0].filename}` : null;
    let imagesArray = req.files.images ? req.files.images.map(file => `/uploads/${file.filename}`) : [];

    // Validate the images array length to be exactly 7
    if (imagesArray.length !== 7) {
        req.flash('error_msg', 'You must upload exactly 7 images.');
        return res.redirect(`/admin/product-details/${productId}`);
    }

    try {
        // Construct your update query
        const query = `
            UPDATE product_details
            SET description = $1,
                video = $2,
                images = $3
            WHERE product_id = $4
        `;
        const dbArray = [description, videoUrl, imagesArray, productId];

        await database.query(query, dbArray);
        
        req.flash('success_msg', 'Product details updated successfully!');
        res.redirect(`/admin/product-details/${productId}`);
    } catch (error) {
        console.error('Error updating product details: ', error);
        req.flash('error_msg', 'Failed to update product details.');
        res.redirect(`/admin/product-details/${productId}`);
    }
});

// Export the router
module.exports = updateProductRouter; 
