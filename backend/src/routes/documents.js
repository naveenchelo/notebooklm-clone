const express = require('express');
const router = express.Router();
const vectorService = require('../services/vectorService');

// Get document statistics
router.get('/:documentId/stats', async (req, res) => {
  try {
    const { documentId } = req.params;
    const stats = await vectorService.getDocumentStats(documentId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get document stats',
      message: error.message,
    });
  }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await vectorService.deleteDocument(documentId);
    res.json({
      message: 'Document deleted successfully',
      documentId: documentId,
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete document',
      message: error.message,
    });
  }
});

module.exports = router;
