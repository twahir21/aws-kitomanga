const navLinks = document.getElementById("navLinks");

function openNav () {
    document.getElementById("open").style.display = "none";
    navLinks.classList.remove("hide");
    navLinks.classList.add("show");
    document.querySelector(".menu").classList.add("visible");

}

function closeNav () {
    document.getElementById("open").style.display = "flex";
    navLinks.classList.remove("show");
    navLinks.classList.add("hide");
    document.querySelector(".menu").classList.remove("visible");
}


document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const description = card.querySelector('.card-description');
        const fullText = card.getAttribute('data-description');
        let typingInterval;
        let currentIndex = 0;

        const typeText = () => {
            description.textContent = '';
            currentIndex = 0;
            description.style.maxHeight = '100px'; // Ensure max-height allows full text
            description.style.opacity = '1';

            typingInterval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    description.textContent += fullText.charAt(currentIndex);
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 30); // Faster speed: 30ms per character
        };

        const clearText = () => {
            clearInterval(typingInterval);
            description.textContent = '';
            description.style.maxHeight = '0';
            description.style.opacity = '0';
        };

        card.addEventListener('mouseenter', () => {
            typeText();
        });

        card.addEventListener('mouseleave', () => {
            clearText();
        });
    });
});