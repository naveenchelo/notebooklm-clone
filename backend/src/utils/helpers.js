const path = require('path');
const fs = require('fs').promises;

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique filename
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(originalName);
  const name = path.basename(originalName, extension);

  return `${name}-${timestamp}-${random}${extension}`;
}

/**
 * Validate file extension
 */
function isValidFileExtension(filename, allowedExtensions = ['.pdf']) {
  const extension = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(extension);
}

/**
 * Clean up file from filesystem
 */
async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.warn('Failed to cleanup file:', filePath, error.message);
    return false;
  }
}

/**
 * Extract page numbers from text
 */
function extractPageNumbers(text) {
  const pageRegex = /page\s+(\d+)/gi;
  const matches = [...text.matchAll(pageRegex)];
  return [...new Set(matches.map(match => parseInt(match[1])))].sort((a, b) => a - b);
}

/**
 * Sanitize text for search
 */
function sanitizeText(text) {
  return text
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .toLowerCase();
}

/**
 * Create citation text
 */
function createCitation(page, text, maxLength = 200) {
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  return `Page ${page}: ${truncatedText}`;
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Parse query parameters with defaults
 */
function parseQueryParams(query, defaults = {}) {
  const params = {};

  Object.keys(defaults).forEach(key => {
    if (query[key] !== undefined) {
      const value = query[key];
      const defaultValue = defaults[key];

      if (typeof defaultValue === 'number') {
        params[key] = parseInt(value) || defaultValue;
      } else if (typeof defaultValue === 'boolean') {
        params[key] = value === 'true';
      } else {
        params[key] = value;
      }
    } else {
      params[key] = defaults[key];
    }
  });

  return params;
}

/**
 * Create error response object
 */
function createErrorResponse(error, message = null) {
  return {
    error: error || 'Unknown error',
    message: message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create success response object
 */
function createSuccessResponse(data = null, message = 'Success') {
  return {
    success: true,
    data: data,
    message: message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate required fields in request body
 */
function validateRequiredFields(body, requiredFields) {
  const missing = [];

  requiredFields.forEach(field => {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missing.push(field);
    }
  });

  return {
    isValid: missing.length === 0,
    missing: missing,
  };
}

module.exports = {
  formatFileSize,
  generateUniqueFilename,
  isValidFileExtension,
  cleanupFile,
  extractPageNumbers,
  sanitizeText,
  createCitation,
  isValidUUID,
  parseQueryParams,
  createErrorResponse,
  createSuccessResponse,
  validateRequiredFields,
};
