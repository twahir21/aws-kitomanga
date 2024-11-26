document.addEventListener('DOMContentLoaded', () => {
    // Success message
    const successFlash = document.getElementById('flash-success');
    if (successFlash) {
        const message = successFlash.getAttribute('data-message');
        if (message) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: message,
                timer: 3000,
                showConfirmButton: false,
            });
        }
    }

    // Error message
    const errorFlash = document.getElementById('flash-error');
    if (errorFlash) {
        const message = errorFlash.getAttribute('data-message');
        if (message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                timer: 3000,
                showConfirmButton: false,
            });
        }
    }

    // Validation errors
    const validationErrorsFlash = document.getElementById('flash-validation-errors');
    if (validationErrorsFlash) {
        const errors = JSON.parse(validationErrorsFlash.getAttribute('data-errors'));
        if (errors && errors.length > 0) {
            let errorMessages = '';
            errors.forEach((error) => {
                errorMessages += `${error.msg}\n`;
            });
            Swal.fire({
                icon: 'error',
                title: 'Validation Errors',
                text: errorMessages,
                timer: 4000,
                showConfirmButton: false,
            });
        }
    }
});
