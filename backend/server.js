// Required package imports
const express = require('express');        // Express framework for creating web server
const multer = require('multer');          // Middleware for handling file uploads
const Tesseract = require('tesseract.js'); // OCR library for extracting text from images
const path = require('path');              // Node.js path module for file path operations

// Express and Multer setup
const app = express();                     // Initialize Express application
const upload = multer({ dest: 'uploads/' });// Configure Multer to store uploads in 'uploads' directory

const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.json());                   // Enable JSON body parsing for requests

// API endpoint for image upload and processing
app.post('/api/upload', upload.single('image'), async (req, res) => {
  // Validate if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Process image using Tesseract OCR
    // - path.resolve gets the absolute path of the uploaded file
    // - 'eng' specifies English language for OCR
    // - logger provides progress updates during processing
    const result = await Tesseract.recognize(path.resolve(req.file.path), 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Log full OCR result for debugging
    console.log("OCR Result:", result.data.text);

    // Process OCR results
    // Extract only the text from each recognized word
    // Transform the data structure to a simpler format
    const wordsWithPositions = result.data.words.map(word => ({
      text: word.text
    }));

    // Send processed results back to client
    res.json({ wordsWithPositions });

  } catch (error) {
    // Error handling
    // Log the error for debugging
    console.error("Error during OCR processing:", error);
    // Send error response to client
    res.status(500).json({ error: 'Failed to parse image text' });
  }
});

// Server configuration and startup
const PORT = process.env.PORT || 5001;     // Use environment port or default to 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

