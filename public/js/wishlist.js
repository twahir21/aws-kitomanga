// Function to get wishlist from localStorage
function getWishlist() {
    let wishlist = localStorage.getItem('wishlist');
    if (wishlist) {
        return JSON.parse(wishlist);
    }
    return [];
}

// Function to save wishlist to localStorage
function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Function to toggle the wishlist item
function toggleWishlist(productId, productImage) {
    let wishlist = getWishlist();
    
    // Check if the product is already in the wishlist
    const itemIndex = wishlist.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
        // Add product to wishlist
        wishlist.push({ productId, productImage });
    } else {
        // Remove product from wishlist
        wishlist.splice(itemIndex, 1);
    }

    saveWishlist(wishlist);
    updateWishlistUI(productId);
}

// Function to update the UI based on whether the product is in the wishlist
function updateWishlistUI(productId) {
    let wishlist = getWishlist();
    const button = document.querySelector(`.add-wishlist[data-product-id="${productId}"]`);
    const icon = button.querySelector('i');

    if (wishlist.some(item => item.productId === productId)) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    }
}

// Initialize wishlist UI on page load
document.addEventListener('DOMContentLoaded', () => {
    const wishListButtons = document.querySelectorAll('.add-wishlist');

    wishListButtons.forEach(button => {
        const productId = button.getAttribute('data-product-id');
        const productImage = button.getAttribute('data-product-image');

        // Add click event listener to each wishlist button
        button.addEventListener('click', function () {
            toggleWishlist(productId, productImage);
        });

        // Set initial wishlist UI state
        updateWishlistUI(productId);
    });
});


// Function to get wishlist from localStorage
function getWishlist() {
    let wishlist = localStorage.getItem('wishlist');
    if (wishlist) {
        return JSON.parse(wishlist);
    }
    return [];
}

// Function to remove item from wishlist
function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    const updatedWishlist = wishlist.filter(item => item.productId !== productId);

    // Save updated wishlist back to localStorage
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

    // Refresh the wishlist display
    displayWishlist();
}

// Function to display the wishlist items on the page
function displayWishlist() {
    const wishlist = getWishlist();
    const wishlistContainer = document.getElementById('wishlistContainer');

    // Clear the wishlist container before rendering
    wishlistContainer.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty!</p>';
        return;
    }

    // Loop through each wishlist item and display it
    wishlist.forEach(item => {
        // Create the HTML elements dynamically
        const wishlistItemDiv = document.createElement('div');
        wishlistItemDiv.classList.add('wishlist-item');

        // Wishlist Image
        const wishlistImage = document.createElement('img');
        wishlistImage.src = item.image;
        wishlistImage.alt = 'Product Image';
        wishlistImage.classList.add('wishlist-image');

        // Wishlist Title (For now, using productId as title. Replace it with actual product title if available)
        const wishlistTitle = document.createElement('h3');
        wishlistTitle.classList.add('wishlist-title');
        wishlistTitle.textContent = `Product ID: ${item.productId}`; // Replace with actual title if available

        // Wishlist Price (If you have price info, add it here, otherwise you can skip this)
        const wishlistPrice = document.createElement('p');
        wishlistPrice.classList.add('wishlist-price');
        wishlistPrice.textContent = `TZS:${item.price || 'N/A'}`;
        // Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-btn');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = function () {
            removeFromWishlist(item.productId);
        };

        // Append elements to the wishlist item div
        wishlistItemDiv.appendChild(wishlistImage);
        wishlistItemDiv.appendChild(wishlistTitle);
        wishlistItemDiv.appendChild(wishlistPrice);
        wishlistItemDiv.appendChild(removeBtn);

        // Append wishlist item to the wishlist container
        wishlistContainer.appendChild(wishlistItemDiv);
    });
}

// Initialize the wishlist display on page load
document.addEventListener('DOMContentLoaded', displayWishlist);
