const express = require('express');
const router = express.Router();
const { uploadLimiter } = require('../middleware/rateLimit');
const { array, handleUploadError } = require('../middleware/upload');
const pdfService = require('../services/pdfService');
const vectorService = require('../services/vectorService');

// Upload and process PDF files
router.post('/', uploadLimiter, array, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one PDF file to upload',
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        // Process PDF
        const pdfResult = await pdfService.processPDF(file.path);

        // Store in vector database
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const vectorResult = await vectorService.storeDocumentChunks(documentId, pdfResult.chunks);

        results.push({
          filename: pdfResult.filename,
          documentId: documentId,
          pages: pdfResult.pages,
          chunks: pdfResult.chunks.length,
          fileSize: pdfResult.fileSize,
          status: 'success',
        });
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        results.push({
          filename: file.originalname,
          status: 'error',
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Upload processing completed',
      results: results,
      totalFiles: req.files.length,
      successCount: results.filter(r => r.status === 'success').length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
