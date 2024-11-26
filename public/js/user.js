document.addEventListener('DOMContentLoaded', () => {
    // Logout Functionality
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            console.log('Logout button clicked.'); // Log when button is clicked

            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
            .then(response => {
                console.log('Response received:', response); // Log the response object
                if (response.redirected) {
                    console.log('Redirecting to:', response.url); // Log the redirect URL
                    window.location.href = response.url;
                } else {
                    if (response.ok) {
                        // Assuming successful logout redirects or updates the UI
                        window.location.href = '/login'; // Redirect to login page
                    } else {
                        console.log('Logout failed:', response.statusText); // Log failure
                        Swal.fire({
                            icon: 'error',
                            title: 'Logout Failed',
                            text: 'Please try again.',
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error during logout:', error); // Log any errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred during logout. Please try again.',
                });
            });
        });
    }


    // Remove Button Functionality
    const removeButtons = document.querySelectorAll('.remove-button');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product');
            const size = button.getAttribute('data-size');
            removeProduct(productId, size);
        });
    });

    // Function to remove a product from the cart
    function removeProduct(productId, size) {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to remove this item (Size: ${size}) from your cart?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/remove-from-cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, size })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the item from the UI
                        const productCard = document.querySelector(`.cart-item[data-product="${productId}"][data-size="${size}"]`);
                        if (productCard) {
                            productCard.remove();
                            Swal.fire(
                                'Removed!',
                                'The product has been removed from your cart.',
                                'success'
                            );
                        }
                        updateTotal();
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error removing from cart:', error);
                    Swal.fire('Error', 'An error occurred while removing the item.', 'error');
                });
            }
        });
    }

    // Function to update the total cart value
    function updateTotal() {
        const totalCart = document.getElementById('totalCart');
        const priceValues = document.querySelectorAll('.priceValues');

        let sum = 0;

        priceValues.forEach(element => {
            sum += parseFloat(element.textContent);
        });

        totalCart.textContent = sum.toFixed(2);
    }

    // Place Order Button Functionality
    const placeOrderButton = document.querySelector('.order > button');
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', () => {
            placeOrder();
        });
    }

    // Function to place an order
    function placeOrder() {
        Swal.fire({
            title: 'Confirm Order',
            text: 'Are you sure you want to place this order?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, place order!'
        }).then((result) => {
            if (result.isConfirmed) {
                const cartItems = [...document.querySelectorAll('.cart-item')].map(item => {
                    return {
                        product_name: item.querySelector('.product-details span:nth-child(1)').textContent.replace('Product: ', '').trim(),
                        size: item.querySelector('.product-details span:nth-child(2)').textContent.replace('Size: ', '').trim(),
                        price: item.querySelector('.product-details span:nth-child(3)').textContent.replace('Price: TZS: ', '').trim(),
                        quantity: item.querySelector('.product-details span:nth-child(4)').textContent.replace('Quantity: ', '').trim(),
                        mainimage: item.querySelector('img').src,
                        subtotal: item.querySelector('.priceValues').textContent.trim()
                    };
                });

                const total = document.getElementById('totalCart').textContent.replace(/,/g, '').trim();

                // User ID and username passed from the backend to the EJS templates
                const userId = document.getElementById('user_id').value;
                const username = document.getElementById('username').value;

                console.log(userId, username)

                const orderData = {
                    cartItems: cartItems,
                    total: total,
                    user_id: userId,
                    username: username
                };

                fetch('/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            'Ordered!',
                            'Your order has been placed successfully.',
                            'success'
                        ).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Error', 'Failed to place order.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error placing order:', err);
                    Swal.fire('Error', 'An error occurred while placing the order. Please try again.', 'error');
                });
            }
        });
    }

    // After successful login
    function handleLoginSuccess() {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];

        if (localCart.length > 0) {
            fetch('/merge-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart: localCart })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem('cart');
                    console.log('Local cart merged successfully');
                } else {
                    console.error('Failed to merge cart:', data.message);
                }
            })
            .catch(error => {
                console.error('Error merging cart:', error);
            });
        }
    }

    handleLoginSuccess(); // Call handleLoginSuccess after login is confirmed

// Select all elements with the class 'download-invoice-button'
const downloadButtons = document.querySelectorAll('.download-invoice-button');

if (downloadButtons) {
    // Iterate over each button and attach the event listener
    downloadButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default behavior

            const orderId = this.dataset.orderId; // Get the order ID from the data attribute

            // Immediately show success message before making any request
            Swal.fire({
                title: 'Processing...',
                text: 'Your invoice is being processed and will download shortly!',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
            });

            // Make an AJAX request to check the invoice status
            fetch(`/download-invoice/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (response.status === 403) {
                    // Show the Swal alert if the user has not made a purchase yet
                    Swal.fire({
                        title: 'Oops...!',
                        text: "You can't download the invoice because you haven't made a purchase yet.",
                        icon: 'info',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else if (response.ok) {
                    // Trigger the download by navigating to the download URL
                    window.location.href = `/download-invoice/${orderId}`;
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Something went wrong. Please try again later.',
                        icon: 'error',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching invoice:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while trying to download the invoice.',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false,
                });
            });
        });
    });
} else {
    console.error('Download buttons not found.');
}


});

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners for all edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const field = button.getAttribute('data-field');
            editField(field);
        });
    });

    // Attach event listeners for all save buttons
    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', () => {
            const field = button.getAttribute('data-field');
            saveField(field);
        });
    });

    // Attach event listeners for all cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', () => {
            const field = button.getAttribute('data-field');
            cancelEdit(field);
        });
    });
});

function editField(field) {
    // Hide the display field and show the edit form
    document.getElementById(`${field}-field`).style.display = 'none';
    document.getElementById(`edit-${field}-form`).style.display = 'block';
}

function cancelEdit(field) {
    // Hide the edit form and show the display field
    document.getElementById(`${field}-field`).style.display = 'block';
    document.getElementById(`edit-${field}-form`).style.display = 'none';
}

// Function to save the edited field
function saveField(field) {
    const input = document.getElementById(`${field}-input`);
    const value = input.value.trim();

    if (value === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Field',
            text: 'This field cannot be empty.',
        });
        return;
    }

    // Simple validation for phone number
    if (field === 'phone') {
        const phonePattern = /^\+?[0-9]{10,15}$/;
        if (!phonePattern.test(value)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Phone Number',
                text: 'Please enter a valid phone number.',
            });
            return;
        }
    }

    // Prepare the data to be sent
    const data = {};
    data[field] = value;

    // Send the updated data to the server
    fetch('/update-user-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the display value
            const displaySpan = document.getElementById(`${field}-value`);
            if (displaySpan) {
                displaySpan.textContent = value;
            }

            // Hide the edit form and show the display field
            cancelEdit(field);

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Information updated successfully.',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: data.message || 'Error updating information.',
            });
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while updating information.',
        });
    });
}
