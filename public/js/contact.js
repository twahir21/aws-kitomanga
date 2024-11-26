document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const usernameInput = form.querySelector("input[name='name']");
    const emailInput = form.querySelector("input[name='email']");
    const phoneInput = form.querySelector("input[name='phone']");
    const messageInput = form.querySelector("textarea[name='message']");

    // Validation patterns
    const usernamePattern = /^(?!.*[-_]{2})(?!.*[ \-_]{2})[a-zA-Z0-9][a-zA-Z0-9-_ ]{2,15}[a-zA-Z0-9]$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phonePattern = /^\+?(971|255|254|256|86)?[1-9][0-9]{8}$/;

    const loader = document.getElementById("loaderContact");
    const overlay = document.getElementById("overlayContact");

    // Show loader
    function showLoader() {
        if (loader) {
            loader.style.display = "block";  // Or 'flex' to center the loader
        }
        if (overlay) {
            overlay.style.display = "block"; // Overlay during loading
        }
    }

    // Hide loader
    function hideLoader() {
        if (loader) {
            loader.style.display = "none";
        }
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        let isValid = true;

        // Validate Username
        if (!usernamePattern.test(usernameInput.value)) {
            isValid = false;
        }

        // Validate Email
        if (!emailPattern.test(emailInput.value)) {
            isValid = false;
        }

        // Validate Phone
        if (!phonePattern.test(phoneInput.value)) {
            isValid = false;
        }

        // Validate Message Length
        const message = messageInput.value.trim();
        const wordCount = message ? message.split(/\s+/).length : 0;
        if (wordCount > 250 || wordCount === 0) {
            isValid = false;
        }

        if (isValid) {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#399918",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, send it!"
            });

            // Only show the loader if the user confirms
            if (result.isConfirmed) {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                showLoader(); // Show the loader before the fetch request

                try {
                    const response = await fetch('/send-mail', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    const responseData = await response.text();
                    hideLoader(); // Hide the loader after the request is complete

                    Swal.fire({
                        title: "Success!",
                        text: "Your email was sent successfully.",
                        icon: "success"
                    });
                    form.reset();
                } catch (error) {
                    hideLoader(); // Hide the loader if there is an error
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Error sending email. Please try again later.",
                    });
                    console.error('Error:', error);
                }
            }
        } else {
            hideLoader(); // Hide loader if validation fails
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Sorry, your data is invalid!",
                footer: '<a href="error">Why do I have this issue?</a>'
            });
        }
    });

    const inputs = document.querySelectorAll(".input");

    function focusFunc() {
        let parent = this.parentNode;
        parent.classList.add("focus");
    }

    function blurFunc() {
        let parent = this.parentNode;
        if (this.value == "") {
            parent.classList.remove("focus");
        }
    }

    inputs.forEach((input) => {
        input.addEventListener("focus", focusFunc);
        input.addEventListener("blur", blurFunc);
    });
});


// Logic for has-value
const inputContainers = document.querySelectorAll('.input-container');

inputContainers.forEach(container => {
    const input = container.querySelector('.input');

    // Function to toggle 'has-value' class
    const toggleClass = () => {
        if (input.value.trim() !== '') {
            container.classList.add('has-value');
        } else {
            container.classList.remove('has-value');
        }
    };

    // Initial check in case inputs are pre-filled (e.g., browser autofill)
    toggleClass();

    // Listen for input events
    input.addEventListener('input', toggleClass);
});