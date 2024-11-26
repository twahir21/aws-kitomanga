// Function to show specific sections of the admin dashboard
function showSection(sectionId) {
    const sections = ['dashboard', 'addProduct', 'order', 'details', 'edit', 'categories', 'order_details'];

    // Hide all sections
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}

// Add event listeners to the navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Initially show the dashboard section
    showSection('dashboard');

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const sectionId = event.currentTarget.getAttribute('data-section');
            showSection(sectionId);

            // Update active link
            navLinks.forEach(nav => nav.classList.remove('active'));
            event.currentTarget.classList.add('active');
        });
    });
});

// Ensure this script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout').addEventListener('click', (e) => {
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
                console.log('Logout failed:', response.statusText); // Log failure
            }
        })
        .catch(error => {
            console.error('Error during logout:', error); // Log any errors
        });
    });
});


        // JavaScript to handle section toggling
        function showSection(sectionId) {
            const sections = document.querySelectorAll('.main-content section');
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });

            // Update active link
            const navLinks = document.querySelectorAll('.sidebar nav ul li a');
            navLinks.forEach(link => {
                if (link.textContent.trim() === sectionId.replace(/([A-Z])/g, ' $1').trim()) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }        

        // Handle File Input Change
        document.getElementById('productImage').addEventListener('change', function() {
            const fileNameSpan = document.getElementById('fileName');
            if (this.files && this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
            } else {
                fileNameSpan.textContent = 'No file chosen';
            }
        });

    // implementing delete user function
    const deleteButtons = document.querySelectorAll('.deleteUser');

    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = button.getAttribute('data-user-id');
            const userName = button.closest('tr').querySelector('td:nth-child(2)').textContent;
    
            // Confirm deletion using Swal
            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to delete user "${userName}" (ID: ${userId})?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/admin/delete-user/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Remove the row from the table
                            const row = button.closest('tr');
                            if (row) {
                                row.remove();
                            }
    
                            // Show success alert with Swal
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'User has been deleted successfully.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                // Reload the page after the user clicks "OK"
                                window.location.reload();
                            });
                        } else {
                            // Show error alert with Swal
                            Swal.fire({
                                title: 'Error!',
                                text: `Error: ${data.message}`,
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting user:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'An error occurred while deleting the user.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    });
                }
            });
        });
    });
    

    document.getElementById('drawButton').addEventListener('click', function() {
        // Fetch sales data from the backend
        fetch('/api/sales-data')
            .then(response => response.json())
            .then(salesData => {
                // Get the canvas context
                const ctx = document.getElementById('salesChart').getContext('2d');
    
                // Show the canvas
                const canvas = document.getElementById('salesChart');
                canvas.style.display = 'block';
    
                // Create the bar chart with real sales data
                const salesChart = new Chart(ctx, {
                    type: 'bar', // Bar chart type
                    data: {
                        labels: salesData.labels, // Real data labels (days)
                        datasets: [{
                            label: 'Sales Over Time',
                            data: salesData.data, // Real sales amounts
                            backgroundColor: 'rgba(75, 192, 192, 0.5)', // Bar color
                            borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Sales Amount'
                                },
                                ticks: {
                                    // Format large numbers as 'K' or 'M'
                                    callback: function(value) {
                                        if (value >= 1000000) {
                                            return (value / 1000000).toFixed(1) + 'M';  // Convert to millions (M)
                                        } else if (value >= 1000) {
                                            return (value / 1000).toFixed(1) + 'K';  // Convert to thousands (K)
                                        }
                                        return value.toLocaleString();  // For smaller values, show normally
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Days'
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    // Format tooltip values with commas or K/M
                                    label: function(tooltipItem) {
                                        const value = tooltipItem.raw;
                                        if (value >= 1000000) {
                                            return (value / 1000000).toFixed(1) + 'M TZS';  // Tooltip for millions
                                        } else if (value >= 1000) {
                                            return (value / 1000).toFixed(1) + 'K TZS';  // Tooltip for thousands
                                        }
                                        return value.toLocaleString() + ' TZS';  // Default for smaller values
                                    }
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching sales data:', error);
            });
    });
    

        // Handle Update Now button click
document.querySelector('.update-button').addEventListener('click', () => {
    const OrderId = document.getElementById('order_id').value;
    const status = document.getElementById('status').value;
    const paid = document.getElementById('paid').value === 'yes'; // Convert to boolean

    // Send the data to the backend
    fetch('/admin/update-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: OrderId, status, paid }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            Swal.fire({
                title: 'Success!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update the order.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Error updating order:', error);
        Swal.fire({
            title: 'Error!',
            text: 'An error occurred while updating the order.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
});

document.getElementById('unused-orders').addEventListener('click', () => {
    // Show a confirmation dialog with SweetAlert2
    Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover these orders!",
        icon: "warning",
        showCancelButton: true, // Show cancel button
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        dangerMode: true,
    }).then((result) => {
        if (result.isConfirmed) {
            // User confirmed deletion
            fetch('/admin/delete-unused-orders', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(result => {
                // Show success message
                Swal.fire("Success!", result.message, "success");
                // Optionally refresh the page or update the UI here
            })
            .catch(error => {
                console.error('Error deleting unused orders:', error);
                // Show error message
                Swal.fire("Error!", 'An error occurred while deleting unused orders.', "error");
            });
        } else {
            // User canceled the deletion
            Swal.fire("Cancelled", "Your orders are safe!", "info");
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const orderSearchInput = document.getElementById('recent-orders');
    const userSearchInput = document.getElementById('recent-users');

    // Function to filter the orders table
    orderSearchInput.addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll('#recentOrders tr');
        
        rows.forEach(row => {
            const username = row.cells[1].textContent.toLowerCase(); // Username is in the second cell (index 1)
            if (username.includes(filter)) {
                row.style.display = ''; // Show row
            } else {
                row.style.display = 'none'; // Hide row
            }
        });
    });

    // Function to filter the users table
    userSearchInput.addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll('#recentUsers tr');
        
        rows.forEach(row => {
            const username = row.cells[1].textContent.toLowerCase(); // Username is in the second cell (index 1)
            if (username.includes(filter)) {
                row.style.display = ''; // Show row
            } else {
                row.style.display = 'none'; // Hide row
            }
        });
    });
});
