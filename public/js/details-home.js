const imageInput = document.getElementById('images');
const imageCountDisplay = document.getElementById('imageCount');
const warningMessage = document.getElementById('warning');

imageInput.addEventListener('change', function() {
    const files = imageInput.files;
    const fileCount = files.length;

    // Update the displayed count of selected files
    imageCountDisplay.textContent = `Selected Images: ${fileCount}`;

    // Check if the number of selected files exceeds 7
    if (fileCount > 7) {
        warningMessage.textContent = 'You can only upload a maximum of 7 images.';
        warningMessage.style.display = 'block'; // Show warning message
    } else {
        warningMessage.textContent = ''; // Clear the warning if under limit
        warningMessage.style.display = 'none'; // Hide warning message
    }
});