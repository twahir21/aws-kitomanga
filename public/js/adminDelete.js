document.getElementById('deleteProductForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting immediately

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this action!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // If user confirms, submit the form
            this.submit();
        }
    });
});