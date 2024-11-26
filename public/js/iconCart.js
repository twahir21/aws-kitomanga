        // Fetch cart data from localStorage
        let cartData = JSON.parse(localStorage.getItem('cart')) || [];

        // Function to render cart data in table
        function renderCart() {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = ''; // Clear existing items
        
            cartData.forEach((item, index) => {
                const row = document.createElement('tr');

        
                row.innerHTML = `
                    <td><img src="${item.mainImage}" alt="Product Image"></td>
                    <td>${item.productId}</td>
                    <td>
                        <button class="subtract" data-index="${index}">-</button>
                        <span id="quantity-${index}">${item.quantity}</span>
                        <button class="add" data-index="${index}">+</button>
                    </td>
                    <td>${item.size}</td>
                    <td id="total-${index}">${formatCurrency(item.total)}</td>
                    <td><button class="remove" data-index="${index}">Remove</button></td>
                `;
        
                cartItems.appendChild(row);
            });
        
            // Attach event listeners to the buttons
            attachEventListeners();
        }
        
        // Function to format number as currency (TZS)
        const formatCurrency = (amount) => {
            return amount.toLocaleString('en-US', { style: 'currency', currency: 'TZS' });
        };
        
        // Function to attach event listeners to the buttons
        function attachEventListeners() {
            // Add event listener to "Add" buttons
            document.querySelectorAll('.add').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    updateQuantity(index, 1); // Increase quantity by 1
                });
            });
        
            // Add event listener to "Subtract" buttons
            document.querySelectorAll('.subtract').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    updateQuantity(index, -1); // Decrease quantity by 1
                });
            });
        
            // Add event listener to "Remove" buttons
            document.querySelectorAll('.remove').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    removeItem(index); // Remove item from cart
                });
            });
        }
        
        // Function to update item quantity
        function updateQuantity(index, change) {
            const item = cartData[index];
            item.quantity = Math.max(1, item.quantity + change); // Ensure quantity is at least 1
        
            // Update total for this item
            item.total = item.quantity * parseFloat(item.total / item.quantity);
        
            // Save the updated cart data to localStorage
            localStorage.setItem('cart', JSON.stringify(cartData));
        
            // Re-render the cart
            renderCart();
        }
        
        // Function to remove an item from the cart
        function removeItem(index) {
            cartData.splice(index, 1); // Remove the item at the given index
        
            // Save the updated cart data to localStorage
            localStorage.setItem('cart', JSON.stringify(cartData));
        
            // Re-render the cart
            renderCart();
        }
        
        // Initial rendering of the cart
        renderCart();