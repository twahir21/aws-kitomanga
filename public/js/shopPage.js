// shopPage.js

// Handle Wishlist Buttons
const wishListButtons = document.querySelectorAll('.add-wishlist');

wishListButtons.forEach(button => {
    button.addEventListener('click', function () {
        toggleWishlist(this);
    });
});

function toggleWishlist(button) {
    const productId = button.getAttribute('data-product-id'); // Ensure each button has a data-product-id attribute
    const icon = button.querySelector('i');

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const existingIndex = wishlist.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    } else {
        // Add to wishlist
        const product = {
            productId: productId,
            image: button.getAttribute('data-product-image'),
            title: button.getAttribute('data-product-title'),
            price: button.getAttribute('data-product-price'),
            link: button.getAttribute('data-product-link') // Link to product details
        };
        wishlist.push(product);
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

// Function to update wishlist count in navigation
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const count = wishlist.length;

    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    wishlistCountElements.forEach(elem => {
        elem.textContent = count;
    });
}

// Initialize wishlist button states and update count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount();

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    wishListButtons.forEach(button => {
        const productId = button.getAttribute('data-product-id');
        const icon = button.querySelector('i');

        const exists = wishlist.some(item => item.productId === productId);

        if (exists) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
        }
    });
});

// Category Filtering (Existing Code)
document.addEventListener('DOMContentLoaded', () => {
    // Select all category links
    const categoryLinks = document.querySelectorAll('a[data-category-id]');
    // Add event listeners to each category link
    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior

            const categoryId = link.getAttribute('data-category-id');
            filterProducts(categoryId);
        });
    });

    // Function to filter products based on category ID
    function filterProducts(categoryId) {
        const products = document.querySelectorAll('.product');

        products.forEach(product => {
            const productCategoryId = product.getAttribute('data-category-id');

            if (categoryId === '0') {
                // Show all products if categoryId is 0 (All Products)
                product.style.display = 'block';
            } else {
                // Show product if it matches the selected category, else hide
                if (productCategoryId === categoryId) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            }
        });
    }

    // Optional: Highlight the active category
    categoryLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove 'active' class from all links
            categoryLinks.forEach(l => l.classList.remove('active'));

            // Add 'active' class to the clicked link
            link.classList.add('active');
        });
    });
});

// Search Functionality (Existing Code)
const searchTypeSelect = document.getElementById('searchType');
const searchInput = document.getElementById('searchInput');
const productContainer = document.querySelector('.product-container');
const homeImageSection = document.querySelector('.home-image');

// Create and append a "No match found" message
const noMatchMessage = document.createElement('h2');
noMatchMessage.id = 'no-match-message';
noMatchMessage.textContent = 'No perfect match found.';
noMatchMessage.style.display = 'none'; // Initially hide the message
productContainer.appendChild(noMatchMessage);

// Add event listener to capture every keystroke in the search input
searchInput.addEventListener('keyup', function() {
    const filter = searchInput.value.toLowerCase().trim(); // Get the search query and convert to lowercase
    const selectedSearchType = searchTypeSelect.value; // Get the selected search type ('product_name' or 'brand')
    const products = productContainer.getElementsByClassName('product'); // Get all product cards

    let hasMatch = false; // Flag to track if there's at least one match

    // Loop through all product cards
    for (let i = 0; i < products.length; i++) {
        let fieldToSearch = '';

        if (selectedSearchType === 'product_name') {
            const productNameElement = products[i].querySelector('.text h1');
            fieldToSearch = productNameElement ? productNameElement.textContent.toLowerCase() : '';
        } else if (selectedSearchType === 'brand') {
            const brandElement = products[i].querySelector('.brand p');
            fieldToSearch = brandElement ? brandElement.textContent.toLowerCase() : '';
        }

        // Check if the field contains the search query
        if (fieldToSearch.indexOf(filter) > -1) {
            products[i].style.display = ''; // Show product card
            hasMatch = true; // Set the flag to true if there is a match
        } else {
            products[i].style.display = 'none'; // Hide product card
        }
    }

    // Hide the home image section if there is text in the search input
    if (filter) {
        homeImageSection.style.display = 'none'; // Hide home image section
    } else {
        homeImageSection.style.display = ''; // Show home image section
    }

    // Show or hide the no match message based on whether there was a match
    if (!hasMatch && filter !== '') {
        noMatchMessage.style.display = ''; // Show no match message
    } else {
        noMatchMessage.style.display = 'none'; // Hide no match message
    }
});
