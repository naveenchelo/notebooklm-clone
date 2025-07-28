const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { single, handleUploadError } = require('../middleware/upload');
const pdfService = require('../services/pdfService');
const vectorService = require('../services/vectorService');
const config = require('../config');

const router = express.Router();

// In-memory storage for documents (replace with database in production)
const documents = new Map();

/**
 * @route POST /api/documents/upload
 * @desc Upload and process PDF document
 * @access Public
 */
router.post('/upload', single, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a PDF file to upload',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;

    // Validate PDF
    const isValid = await pdfService.validatePDF(filePath);
    if (!isValid) {
      // Clean up invalid file
      await fs.unlink(filePath);
      return res.status(400).json({
        error: 'Invalid PDF',
        message: 'The uploaded file is not a valid PDF or contains no readable text',
      });
    }

    // Generate document ID
    const documentId = uuidv4();

    // Process PDF
    const processingResult = await pdfService.processPDF(filePath);

    // Store in vector database
    const vectorResult = await vectorService.storeDocumentChunks(
      documentId,
      processingResult.chunks
    );

    // Create document record
    const document = {
      id: documentId,
      filename: originalName,
      originalName: originalName,
      filePath: filePath,
      fileSize: fileSize,
      pages: processingResult.pages,
      chunks: processingResult.chunks.length,
      metadata: processingResult.metadata,
      processingInfo: processingResult.processingInfo,
      vectorInfo: vectorResult,
      uploadedAt: new Date().toISOString(),
      status: 'processed',
    };

    // Store document record
    documents.set(documentId, document);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      document: document,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/documents
 * @desc Get all documents
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const documentsList = Array.from(documents.values()).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.originalName,
      filePath: doc.filePath,
      pages: doc.pages,
      chunks: doc.chunks,
      fileSize: doc.fileSize,
      uploadedAt: doc.uploadedAt,
      metadata: doc.metadata,
      processingInfo: doc.processingInfo,
      vectorInfo: doc.vectorInfo,
      status: doc.status,
    }));

    res.json({
      success: true,
      documents: documentsList,
      total: documentsList.length,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Failed to retrieve documents',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/documents/debug
 * @desc Get debug information about documents storage
 * @access Public
 */
router.get('/debug', async (req, res) => {
  try {
    res.json({
      success: true,
      totalDocuments: documents.size,
      documentIds: Array.from(documents.keys()),
      documents: Array.from(documents.entries()).map(([id, doc]) => ({
        id,
        filename: doc.filename,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      error: 'Failed to get debug info',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/documents/:id
 * @desc Get document by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist',
      });
    }

    res.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        pages: document.pages,
        chunks: document.chunks,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
        metadata: document.metadata,
        processingInfo: document.processingInfo,
        vectorInfo: document.vectorInfo,
        status: document.status,
      },
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      error: 'Failed to retrieve document',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/documents/:id/content
 * @desc Get document content (chunks)
 * @access Public
 */
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist',
      });
    }

    // Get chunks from PDF service
    const processingResult = await pdfService.processPDF(document.filePath);

    res.json({
      success: true,
      documentId: id,
      chunks: processingResult.chunks,
      totalChunks: processingResult.chunks.length,
    });
  } catch (error) {
    console.error('Get document content error:', error);
    res.status(500).json({
      error: 'Failed to retrieve document content',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/documents/:id/page/:pageNumber
 * @desc Get specific page content
 * @access Public
 */
router.get('/:id/page/:pageNumber', async (req, res) => {
  try {
    const { id, pageNumber } = req.params;
    const document = documents.get(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist',
      });
    }

    const pageNum = parseInt(pageNumber);
    if (pageNum < 1 || pageNum > document.pages) {
      return res.status(400).json({
        error: 'Invalid page number',
        message: `Page number must be between 1 and ${document.pages}`,
      });
    }

    // Get page content
    const pageContent = await pdfService.getPageRange(document.filePath, pageNum, pageNum);

    res.json({
      success: true,
      documentId: id,
      pageNumber: pageNum,
      content: pageContent,
      totalPages: document.pages,
    });
  } catch (error) {
    console.error('Get page content error:', error);
    res.status(500).json({
      error: 'Failed to retrieve page content',
      message: error.message,
    });
  }
});

/**
 * @route DELETE /api/documents/:id
 * @desc Delete document
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist',
      });
    }

    // Delete from vector database
    await vectorService.deleteDocument(id);

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      console.warn('Failed to delete file:', fileError.message);
    }

    // Remove from documents map
    documents.delete(id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
      documentId: id,
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/documents/:id/stats
 * @desc Get document statistics
 * @access Public
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist',
      });
    }

    // Get document stats
    const stats = await pdfService.getDocumentStats(document.filePath);

    // Get vector stats
    const vectorStats = await vectorService.getDocumentStats(id);

    res.json({
      success: true,
      documentId: id,
      stats: {
        ...stats,
        vectorStats: vectorStats,
      },
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve document statistics',
      message: error.message,
    });
  }
});

module.exports = router;
