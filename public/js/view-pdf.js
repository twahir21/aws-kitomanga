document.getElementById('viewButton').addEventListener('click', function () {
    const invoiceKey = document.getElementById('invoiceKey').value;
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');

    // Construct the URL to the PDF file
    const pdfUrl = `/admin/view-pdf/${invoiceKey}`;

    // Check if the user has entered a key
    if (!invoiceKey) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter an invoice key!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Set the iframe source to the PDF file
    pdfFrame.src = pdfUrl;

    // Show the PDF viewer
    pdfViewer.style.display = 'block';

    // Check for 404 errors by listening to the iframe load event
    pdfFrame.onerror = function () {
        Swal.fire({
            title: 'Error!',
            text: 'PDF not found!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        // Hide the iframe if the PDF is not found
        pdfViewer.style.display = 'none';
    };
});
