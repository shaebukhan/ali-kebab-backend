const multer = require('multer');

// Use memory storage to temporarily hold the files
const storage = multer.memoryStorage();

// File filter to validate image  
const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith('image')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('File type not supported. Only images and PDFs are allowed.'), false); // Reject the file
    }
};

// Configure multer with the memory storage and file filter
const upload = multer({
    storage: storage,   // Store files temporarily in memory
    fileFilter: fileFilter, // File type validation
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    }
});

module.exports = upload;
