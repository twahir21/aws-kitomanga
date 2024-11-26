const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const signLink = document.getElementById('sign-Link');
const loginLink = document.getElementById('loginLink');
const formSignIn = document.getElementById('sign-in');
const formSignUp = document.getElementById('sign-up');

// Password visibility toggle function
const togglePasswordVisibility = (toggleButtonId, passwordFieldId) => {
    const toggleButton = document.getElementById(toggleButtonId);
    const passwordField = document.getElementById(passwordFieldId);

    toggleButton.addEventListener('click', () => {
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
        toggleButton.classList.toggle('fa-eye');
        toggleButton.classList.toggle('fa-eye-slash');
    });
};

// Add password visibility toggle to form fields
togglePasswordVisibility('toggle-signup-password', 'signup-password');
togglePasswordVisibility('toggle-confirm-password', 'confirm-password');
togglePasswordVisibility('toggle-login-password', 'login-password');

// Function to handle form toggling based on screen width
function handleToggle() {
    if (window.innerWidth < 768) {
        // Mobile layout
        signLink.addEventListener('click', () => {
            formSignIn.classList.add('down');
            formSignUp.classList.add('activate');
            formSignUp.classList.remove('up');
            formSignIn.classList.remove('activate');
        });

        loginLink.addEventListener('click', () => {
            formSignUp.classList.add('up');
            formSignIn.classList.add('activate');
            formSignIn.classList.remove('down');
            formSignUp.classList.remove('activate');
        });
    } else {
        // For larger screens
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    }
}

// Function to handle screen resizing behavior
function handleResize() {
    // Recheck the screen width and adjust behaviors accordingly
    const container = document.querySelector('.container');
    
    if (container) {
        if (window.innerWidth < 768) {
            container.classList.remove('active'); // Reset active state on mobile
        }
    }

    handleToggle(); // Reapply toggle behavior when resizing
}

// Add event listener for window resize and initial load
window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize); // Trigger on load

// Call the function once when the script loads
handleResize();
