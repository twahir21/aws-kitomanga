// cart.js (Ensure this file is properly linked in your HTML)

// Select DOM elements
const add = document.getElementById('add');
const subtract = document.getElementById('subtract');
const value = document.getElementById('value');
const mainImage = document.getElementById('mainImage');
const images = [image1, image2, image3, image4, image5, image6]; // Ensure these image variables are defined
const total = document.getElementById('total');
const cart = document.getElementById('cart');
const size = document.getElementById('size');
const product_id = document.getElementById('product_id');
const productPriceElement = document.getElementById('productPrice');

// Parse product price as a float
let productPriceText = productPriceElement.innerHTML.trim();

// Remove any non-numeric characters except for '.' and ',' (for decimal and thousand separators)
productPriceText = productPriceText.replace(/[^0-9.,]/g, '');

// Replace comma with empty string if it's used as a thousand separator
// This assumes that '.' is used as the decimal separator
productPriceText = productPriceText.replace(/,/g, '');

// Parse the cleaned string to a float
const productPrice = parseFloat(productPriceText);

if (isNaN(productPrice)) {
    console.error('Error: Unable to parse product price. Please check the format.');
    // Optionally, display an error message to the user
}

// Function to format number as currency (TZS)
const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'TZS' });
};

// Initialize quantity and total
let quantity = parseInt(value.innerHTML, 10);
if (isNaN(quantity)) quantity = 0;

const updateTotal = () => {
    const totalAmount = productPrice * quantity;
    total.innerHTML = formatCurrency(totalAmount);
};

// Initial total calculation
updateTotal();

// Event listeners for add and subtract buttons
add.addEventListener('click', () => {
    quantity += 1;
    value.innerHTML = quantity;
    updateTotal();
});

subtract.addEventListener('click', () => {
    if (quantity > 0) {
        quantity -= 1;
        value.innerHTML = quantity;
        updateTotal();
    }
});

// Swap images functionality
images.forEach(img => {
    img.addEventListener('click', () => swapImages(mainImage, img));
});

function swapImages(img1, img2) {
    const tempSrc = img1.src;
    img1.src = img2.src;
    img2.src = tempSrc;
}

cart.addEventListener('click', () => {
    const quantity = parseInt(value.innerHTML, 10);

    if (quantity === 0) {
        Swal.fire({
            title: "Incorrect value?",
            text: "Total Quantity of product can never be zero",
            icon: "question",
            timer: 2000
        });
        return;
    }

    const totalAmount = parseFloat(total.innerHTML.replace(/[^\d.-]/g, ''));

    if (isNaN(totalAmount)) {
        console.error('Error: Total amount is NaN');
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to calculate the total. Please try again.",
            timer: 2000
        });
        return;
    }

    const cartData = {
        productId: product_id.value,
        quantity: quantity,
        size: size.value,
        mainImage: mainImage.src,
        total: totalAmount
    };

    const isLoggedIn = window.isLoggedIn || false;
    if (isLoggedIn) {
        // Logic for logged-in users
        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Your cart is submitted successfully, please login to add to the cart",
                    showConfirmButton: false,
                    timer: 3500,
                    customClass: {
                        title: 'swal-title'
                    }
                });
            } else {
                throw new Error(data.message || 'Failed to add to cart');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || 'Failed to add to cart',
                timer: 2000
            });
        });
    } else {
        // Logic for guest users (localStorage)
        let existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = existingCart.findIndex(item => item.productId === cartData.productId && item.size === cartData.size);

        if (existingItemIndex > -1) {
            // Replace the existing item with the new one
            existingCart[existingItemIndex] = cartData;
        } else {
            // Add new item to cart
            existingCart.push(cartData);
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Item added to cart, please login to add to the cart",
            showConfirmButton: false,
            timer: 3500,
            customClass: {
                title: 'swal-title'
            }
        });
    }
});
