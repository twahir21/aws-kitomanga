// Handle close and open mobile navigation
document.getElementById('menuButton').addEventListener('click', toggleMobileMenu);
document.getElementById('closeButton').addEventListener('click', toggleMobileMenu);

// Handle links in main mobile menu
const mainMenuLinks = ['home', 'about', 'login', 'contact', 'faq', 'terms'];
mainMenuLinks.forEach(id => {
    const link = document.getElementById(id);
    if (link) {
        link.addEventListener('click', toggleMobileMenu);
    }
});

// Toggle Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Close Mobile Menu when clicking outside the menu content
window.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.querySelector('.mobile-container .menu');
    if (event.target !== mobileMenu && !mobileMenu.contains(event.target) && !menuIcon.contains(event.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Handle Mobile Categories Menu
document.getElementById('categoriesButton').addEventListener('click', toggleMobileCategoriesMenu);
document.getElementById('closeCategoriesButton').addEventListener('click', toggleMobileCategoriesMenu);

function toggleMobileCategoriesMenu() {
    const mobileCategoriesMenu = document.getElementById('mobileCategoriesMenu');
    mobileCategoriesMenu.classList.toggle('active');
}

// Handle categories dropdown in mobile menu
const mobileDropdowns = document.querySelectorAll('#mobileCategoriesMenu .mobile-dropdown > a');
mobileDropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
        e.preventDefault();
        const parentLi = this.parentElement;
        parentLi.classList.toggle('active');
    });
});

// Close Mobile Categories Menu when clicking outside the menu content
window.addEventListener('click', function(event) {
    const mobileCategoriesMenu = document.getElementById('mobileCategoriesMenu');
    const categoriesIcon = document.querySelector('.mobile-container .categories');
    if (event.target !== mobileCategoriesMenu && !mobileCategoriesMenu.contains(event.target) && !categoriesIcon.contains(event.target)) {
        mobileCategoriesMenu.classList.remove('active');
    }
});

// Validate email format
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
}

// Update Cart and Wishlist Counts dynamically based on localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve cart data from localStorage
    let cartData = JSON.parse(localStorage.getItem('cart')) || [];

    // Calculate the number of items in the cart
    const cartCount = cartData.length;

        // Retrieve wishlist data from localStorage
        let wishlistData = JSON.parse(localStorage.getItem('wishlist')) || [];

        // Calculate the number of items in the wishlist
        const wishlistCount = wishlistData.length;

    // Update cart and wishlist counts in both desktop and mobile views
    document.querySelectorAll('#cartCount, #mobileCartCount, #mobileCartCount2').forEach(el => el.textContent = cartCount);
    document.querySelectorAll('#wishlistCount, #mobileWishlistCount, #mobileWishlistCount2').forEach(el => el.textContent = wishlistCount);

    // Navigation icons functionality
    document.querySelectorAll('#iconCart, #iconCartMobile, #iconCartMobile2').forEach(el => {
        el.addEventListener('click', () => window.location.href = '/cart');
    });

    document.querySelectorAll('#iconWishList, #iconWishListMobile, #iconWishListMobile2').forEach(el => {
        el.addEventListener('click', () => window.location.href = '/WishList');
    });

    const iconLogin = document.getElementById('iconLogin');
    if (iconLogin) {
        iconLogin.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }

});


