// Function to display the number of selected images
document.getElementById('images').addEventListener('change', function(event) {
    const imageCount = event.target.files.length;
    document.getElementById('imageCount').innerText = `Selected Images: ${imageCount}`;
});

// Function to display flash messages using SweetAlert
const showFlashMessages = (successMessage, errorMessage) => {
    if (successMessage) {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: successMessage,
            timer: 2000, // 2 seconds
            timerProgressBar: true,
        });
    }

    if (errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: errorMessage,
            timer: 2000, // 2 seconds
            timerProgressBar: true,
        });
    }
};

// Check for flash messages and display them
window.onload = function() {
    const successMessage = document.getElementById('successMessage') ? document.getElementById('successMessage').textContent : null;
    const errorMessage = document.getElementById('errorMessage') ? document.getElementById('errorMessage').textContent : null;
    showFlashMessages(successMessage, errorMessage);
};
