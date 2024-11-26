    // Get references to the input field and table body
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('productTable');

    // Add event listener to capture every keystroke
    searchInput.addEventListener('keyup', function() {
        const filter = searchInput.value.toLowerCase();  // Get the search query and convert to lowercase
        const rows = tableBody.getElementsByTagName('tr');  // Get all table rows

        // Loop through all rows
        for (let i = 0; i < rows.length; i++) {
            const productNameCell = rows[i].getElementsByTagName('td')[1];  // Get the product name cell
            
            if (productNameCell) {
                const productName = productNameCell.textContent || productNameCell.innerText;
                
                // If the product name matches the search query, show the row, otherwise hide it
                if (productName.toLowerCase().indexOf(filter) > -1) {
                    rows[i].style.display = '';  // Show row
                } else {
                    rows[i].style.display = 'none';  // Hide row
                }
            }
        }
    });
