let li = document.querySelectorAll(".faq-text li");
for (var i = 0; i < li.length; i++) {
  li[i].addEventListener("click", (e)=>{
    let clickedLi;
    if(e.target.classList.contains("question-arrow")){
      clickedLi = e.target.parentElement;
    }else{
      clickedLi = e.target.parentElement.parentElement;
    }
   clickedLi.classList.toggle("showAnswer");
  });
}

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.querySelector('.input-button input');
    const searchButton = document.querySelector('.input-button .button button');
    const faqItems = document.querySelectorAll('.faq-text li');

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase().trim();
        if (query === "") {
            Swal.fire({
                icon: 'question',
                title: 'Oops...',
                text: 'Please enter a question to search!',
            });
            return;
        }

        const queryWords = query.split(" ");
        let bestMatchItem = null;
        let maxMatches = 0;

        faqItems.forEach(item => {
            const questionText = item.querySelector('.question').textContent.toLowerCase();
            const questionWords = questionText.split(" ");
            let matchCount = 0;

            queryWords.forEach(word => {
                if (questionWords.includes(word)) {
                    matchCount++;
                }
            });

            if (matchCount > maxMatches) {
                maxMatches = matchCount;
                bestMatchItem = item;
            }
        });

        if (maxMatches > 0) {
            faqItems.forEach(item => item.style.display = 'none'); // Hide all items
            bestMatchItem.style.display = 'block'; // Display the best matching item
        } else {
            faqItems.forEach(item => item.style.display = 'block'); // Display all items
            Swal.fire({
                icon: 'info',
                title: 'No Exact Match Found',
                text: 'Showing all questions. Please refine your search.',
            });
        }
    });
});