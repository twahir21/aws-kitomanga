const express = require('express');
const publicRouter = express.Router();




// Supply all public files
publicRouter.get('/terms', (req, res) => {
    res.render('terms');  
});

publicRouter.get('/faq', (req, res) => {
    res.render('faq');  
});

publicRouter.get('/contact', (req, res) => {
    res.render('contact');  
});

publicRouter.get('/about', (req, res) => {
    res.render('about');  
});

publicRouter.get('/error', (req, res) => {
    res.render('errors');  
});

publicRouter.get('/cart', (req, res) => {
    res.render('cart');  
});

publicRouter.get('/WishList', (req, res) => {
    res.render('wishList');  
});

// Handle 404 errors
publicRouter.use((req, res) => {
    res.status(404).render('404');  
});

module.exports = publicRouter;
