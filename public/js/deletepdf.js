document.getElementById('deleteButton').addEventListener('click', async function() {
    const selectedFiles = Array.from(document.querySelectorAll('input[name="files"]:checked')).map(input => input.value);
    
    if (selectedFiles.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No files selected',
            text: 'Please select at least one file to delete.'
        });
        return;
    }

    const response = await fetch('/admin/delete-pdfs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files: selectedFiles })
    });

    if (response.ok) {
        const result = await response.json();
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: result.message
        });
        window.location.reload(); // Refresh the page to update the list
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete files. Please try again.'
        });
    }
});
