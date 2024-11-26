// adminEdit.js

document.addEventListener('DOMContentLoaded', () => {
    const productImageInput = document.getElementById('productImage');
    const fileNameSpan = document.getElementById('fileName');
    const imageCountP = document.getElementById('imageCount');
    const imagesInput = document.getElementById('images');
    const warningP = document.getElementById('warning');

    // Handle single image file input for editing product
    if (productImageInput) {
        productImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                fileNameSpan.textContent = file.name;
            } else {
                fileNameSpan.textContent = 'No file chosen';
            }
        });
    }

    // Handle multiple images file input for adding product details
    if (imagesInput) {
        imagesInput.addEventListener('change', (event) => {
            const files = event.target.files;
            const fileCount = files.length;

            imageCountP.textContent = `Selected Images: ${fileCount}`;

            // Check if more than 7 images are selected
            if (fileCount > 7) {
                warningP.textContent = 'You can upload up to 7 images only.';
                warningP.style.color = 'red';
            } else {
                warningP.textContent = '';
            }
        });
    }
});


// Automatically remove flash messages after 3 seconds
setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.transition = 'opacity 0.5s ease-out';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    });
}, 4500);