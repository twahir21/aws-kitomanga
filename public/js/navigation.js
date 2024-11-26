const sliderWrapper = document.querySelector('.image');
const slides = document.querySelectorAll('.slide');
let currentIndex = 0;
const totalSlides = slides.length;

// Function to show the next slide
function showNextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// Function to show the previous slide
function showPreviousSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// Change slide every 6 seconds
let autoSlide = setInterval(showNextSlide, 6000);

// Add click event listeners to the buttons
document.querySelector('.next').addEventListener('click', () => {
    clearInterval(autoSlide); // Stops the auto slider temporarily
    showNextSlide();
    autoSlide = setInterval(showNextSlide, 6000); // Restart auto slider
});

document.querySelector('.prev').addEventListener('click', () => {
    clearInterval(autoSlide); // Stops the auto slider temporarily
    showPreviousSlide();
    autoSlide = setInterval(showNextSlide, 6000); // Restart auto slider
});

