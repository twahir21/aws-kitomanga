const inputs = document.querySelectorAll('.otp-card-inputs input');
const verifyButton = document.querySelector('.otp-card button');

// Function to check if all inputs are filled
const checkInputs = () => {
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value === '') {
            allFilled = false;
        }
    });
    if (allFilled) {
        verifyButton.removeAttribute('disabled');
    } else {
        verifyButton.setAttribute('disabled', true);
    }
};

inputs.forEach((input, index) => {
    input.addEventListener('keyup', (e) => {
        const currentElement = e.target;
        const nextElement = input.nextElementSibling;
        const prevElement = input.previousElementSibling;

        const reg = /^[a-zA-Z0-9]+$/;

        if (e.key === 'Backspace' && prevElement) { // Handle backspace
            prevElement.focus();
            prevElement.value = '';
            verifyButton.setAttribute('disabled', true);
        } else if (reg.test(currentElement.value)) { // If valid character
            if (nextElement) {
                nextElement.focus();
            }
        } else {
            currentElement.value = ''; // Remove invalid character
        }

        checkInputs();
    });

    input.addEventListener('input', checkInputs);
});

document.getElementById('verify-otp-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const otpInputs = document.querySelectorAll('.otp-card-inputs input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    const email = document.querySelector('input[name="email"]').value; // Get email from hidden input

    if (!email) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Email is missing. Please go back and try again.",
            footer: '<a href="#">Why do I have this issue?</a>'
        });
        return;
    }

    try {
        const response = await fetch('/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.text();
        if (response.ok) {
            Swal.fire({
                title: "Success!",
                text: 'Your Account is activated Successfully, you are now login',
                icon: "success",
                timer: 3000, // Auto-close after 3000 milliseconds (3 seconds)
                timerProgressBar: true, // Optional: Shows a progress bar
                showConfirmButton: false // Hides the confirm button
            }).then(() => {
                window.location.href = '/dashboard'; // Redirect to the dashboard page
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: 'Failed to verify OTP, please enter valid OTP or resend it',
                footer: '<a href="#">Why do I have this issue?</a>'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Failed to verify OTP",
            footer: '<a href="#">Why do I have this issue?</a>'
        });
    }
});