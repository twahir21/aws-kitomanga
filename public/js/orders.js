        /* admin-orders.js */

// Sample order data (In real application, fetch from backend)
const orders = [
    {
        orderId: 'ORD12345',
        customerName: 'Alice Smith',
        date: '2023-10-01',
        status: 'Pending',
        total: 99.99,
        items: [
            { name: 'Wireless Mouse', quantity: 2, price: 25.00 },
            { name: 'Keyboard', quantity: 1, price: 49.99 },
        ],
        shippingAddress: '123 Maple Street, Springfield, USA',
        billingAddress: '123 Maple Street, Springfield, USA',
    },
    {
        orderId: 'ORD12346',
        customerName: 'Bob Johnson',
        date: '2023-10-02',
        status: 'Shipped',
        total: 59.45,
        items: [
            { name: 'USB-C Cable', quantity: 3, price: 19.82 },
        ],
        shippingAddress: '456 Oak Avenue, Metropolis, USA',
        billingAddress: '456 Oak Avenue, Metropolis, USA',
    },
    // Add more orders as needed
];

// Function to render orders in the table
function renderOrders() {
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = ''; // Clear existing rows

    orders.forEach(order => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${order.date}</td>
            <td>${order.status}</td>
            <td>${order.total.toFixed(2)}</td>
            <td><button class="action-btn" onclick="openOrderModal('${order.orderId}')">View</button></td>
        `;

        orderList.appendChild(tr);
    });
}

// Function to open the modal with order details
function openOrderModal(orderId) {
    const modal = document.getElementById('orderModal');
    const orderDetailsDiv = document.getElementById('orderDetails');

    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    // Populate order details
    orderDetailsDiv.innerHTML = `
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer Name:</strong> ${order.customerName}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
        <p><strong>Billing Address:</strong> ${order.billingAddress}</p>
        <h3>Items:</h3>
        <ul>
            ${order.items.map(item => `<li>${item.name} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}</li>`).join('')}
        </ul>
    `;

    // Set current order ID for updating
    modal.setAttribute('data-order-id', orderId);

    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
}

// Function to update order status
function updateOrderStatus() {
    const modal = document.getElementById('orderModal');
    const orderId = modal.getAttribute('data-order-id');
    const newStatus = document.getElementById('orderStatus').value;

    // Find the order and update status
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        renderOrders(); // Refresh the order list
        closeModal();
        alert(`Order ${orderId} status updated to ${newStatus}.`);
    }
}

// Event listener for modal close button
document.querySelector('.close').addEventListener('click', closeModal);

// Event listener for updating status
document.getElementById('updateStatusBtn').addEventListener('click', updateOrderStatus);

// Event listener to close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target == modal) {
        closeModal();
    }
});

// Initial render
renderOrders();