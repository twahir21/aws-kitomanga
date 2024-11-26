const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { ensureAdmin } = require('../middlewares/auth');


// Directory where PDF files are stored
const pdfDirectory = path.join(__dirname, '../public/pdf');

// Get all PDF files
router.get('/view-pdfs', ensureAdmin, (req, res) => {
    fs.readdir(pdfDirectory, (err, files) => {
        if (err) {
            console.error('Error reading PDF directory:', err);
            return res.status(500).send('Error reading PDF directory');
        }

        // Filter for PDF files only
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        res.render('admin/deletepdf', { pdfFiles });
    });
});

// Delete selected PDF files
router.post('/delete-pdfs', ensureAdmin, (req, res) => {
    const filesToDelete = req.body.files; // An array of file names to delete

    const deletePromises = filesToDelete.map(file => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(pdfDirectory, file);
            fs.unlink(filePath, err => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    });

    Promise.all(deletePromises)
        .then(() => res.json({ message: 'Files deleted successfully' }))
        .catch(err => res.status(500).json({ error: 'Error deleting files' }));
});

module.exports = router;
