        // Example: Handle Newsletter Subscription Form Submission
        let newsLetter = document.querySelector('.newsletter form');
        newsLetter.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = newsLetter.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (validateEmail(email)) {
                // Implement your subscription logic here (e.g., AJAX request)
                Swal.fire({
                    title: "Oopss",
                    text: "Service is unavailable!",
                    icon: "info",
                    timer: 2000,
            });
                emailInput.value = '';
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Enter a valid email!",
                    icon: "error",
                    timer: 2000,
            });
            }
        });

        function validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
            return re.test(String(email).toLowerCase());
        }

