const express = require('express');
const vectorService = require('../services/vectorService');

const router = express.Router();

/**
 * @route POST /api/search/:documentId
 * @desc Search within a specific document
 * @access Public
 */
router.post('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { query, topK = 10, threshold = 0.7 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query cannot be empty',
      });
    }

    // Search for relevant chunks
    const searchResults = await vectorService.searchChunks(query, documentId, topK);

    // Filter results by similarity threshold
    const filteredResults = searchResults.filter(result => result.score >= threshold);

    // Group results by page
    const resultsByPage = filteredResults.reduce((acc, result) => {
      const page = result.metadata.page;
      if (!acc[page]) {
        acc[page] = [];
      }
      acc[page].push(result);
      return acc;
    }, {});

    // Sort pages by average score
    const sortedPages = Object.entries(resultsByPage)
      .map(([page, results]) => ({
        page: parseInt(page),
        results: results,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    res.json({
      success: true,
      query: query,
      results: filteredResults,
      resultsByPage: sortedPages,
      totalResults: filteredResults.length,
      pagesFound: sortedPages.length,
      searchStats: {
        query: query,
        topK: topK,
        threshold: threshold,
        averageScore:
          filteredResults.length > 0
            ? filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length
            : 0,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/search/global
 * @desc Search across all documents
 * @access Public
 */
router.post('/global', async (req, res) => {
  try {
    const { query, topK = 10, threshold = 0.7 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query cannot be empty',
      });
    }

    // Search across all documents
    const searchResults = await vectorService.searchChunks(query, null, topK);

    // Filter results by similarity threshold
    const filteredResults = searchResults.filter(result => result.score >= threshold);

    // Group results by document
    const resultsByDocument = filteredResults.reduce((acc, result) => {
      const documentId = result.metadata.documentId;
      if (!acc[documentId]) {
        acc[documentId] = [];
      }
      acc[documentId].push(result);
      return acc;
    }, {});

    // Sort documents by average score
    const sortedDocuments = Object.entries(resultsByDocument)
      .map(([documentId, results]) => ({
        documentId: documentId,
        results: results,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        pagesFound: [...new Set(results.map(r => r.metadata.page))].length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    res.json({
      success: true,
      query: query,
      results: filteredResults,
      resultsByDocument: sortedDocuments,
      totalResults: filteredResults.length,
      documentsFound: sortedDocuments.length,
      searchStats: {
        query: query,
        topK: topK,
        threshold: threshold,
        averageScore:
          filteredResults.length > 0
            ? filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length
            : 0,
      },
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      error: 'Global search failed',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/search/:documentId/suggestions
 * @desc Get search suggestions for a document
 * @access Public
 */
router.get('/:documentId/suggestions', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Query parameter is required',
      });
    }

    // Search for suggestions
    const searchResults = await vectorService.searchChunks(query, documentId, 5);

    // Extract unique terms from search results
    const terms = new Set();
    searchResults.forEach(result => {
      const words = result.metadata.text
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && word.includes(query.toLowerCase()));
      words.forEach(word => terms.add(word));
    });

    const suggestions = Array.from(terms).slice(0, 10);

    res.json({
      success: true,
      query: query,
      suggestions: suggestions,
      searchResults: searchResults.length,
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get search suggestions',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/search/:documentId/highlights
 * @desc Get highlighted search results for a specific page
 * @access Public
 */
router.get('/:documentId/highlights', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { query, page } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Query parameter is required',
      });
    }

    if (!page || isNaN(parseInt(page))) {
      return res.status(400).json({
        error: 'Invalid page',
        message: 'Page parameter is required and must be a number',
      });
    }

    // Search for results on specific page
    const searchResults = await vectorService.searchChunks(query, documentId, 20);

    // Filter results for the specific page
    const pageResults = searchResults.filter(result => result.metadata.page === parseInt(page));

    // Create highlights
    const highlights = pageResults.map(result => ({
      id: result.id,
      text: result.metadata.text,
      score: result.score,
      startPosition: result.metadata.startPosition,
      endPosition: result.metadata.endPosition,
      chunkIndex: result.metadata.chunkIndex,
    }));

    res.json({
      success: true,
      query: query,
      page: parseInt(page),
      highlights: highlights,
      totalHighlights: highlights.length,
    });
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({
      error: 'Failed to get highlights',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/search/stats
 * @desc Get search statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const indexStats = await vectorService.getIndexStats();

    res.json({
      success: true,
      stats: {
        totalVectors: indexStats.totalVectors,
        dimension: indexStats.dimension,
        indexFullness: indexStats.indexFullness,
        namespaces: indexStats.namespaces,
      },
    });
  } catch (error) {
    console.error('Get search stats error:', error);
    res.status(500).json({
      error: 'Failed to get search statistics',
      message: error.message,
    });
  }
});

module.exports = router;
