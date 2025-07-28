const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class PDFService {
  constructor() {
    this.chunkSize = config.textProcessing.chunkSize;
    this.chunkOverlap = config.textProcessing.chunkOverlap;
    this.maxChunks = config.textProcessing.maxChunksPerDocument;
  }

  /**
   * Extract text from PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} - Extracted text with metadata
   */
  async extractText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);

      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
        metadata: data.metadata,
        version: data.version,
      };
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Split text into chunks with overlap
   * @param {string} text - Text to chunk
   * @param {number} pages - Number of pages
   * @returns {Array} - Array of text chunks with metadata
   */
  chunkText(text, pages) {
    const chunks = [];
    let currentPosition = 0;
    let chunkIndex = 0;

    while (currentPosition < text.length && chunkIndex < this.maxChunks) {
      const chunkEnd = Math.min(currentPosition + this.chunkSize, text.length);
      let chunkText = text.substring(currentPosition, chunkEnd);

      // Try to break at sentence boundaries
      if (chunkEnd < text.length) {
        const lastPeriod = chunkText.lastIndexOf('.');
        const lastNewline = chunkText.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > currentPosition + this.chunkSize * 0.7) {
          chunkText = text.substring(currentPosition, currentPosition + breakPoint + 1);
          currentPosition = currentPosition + breakPoint + 1;
        } else {
          currentPosition = chunkEnd;
        }
      } else {
        currentPosition = chunkEnd;
      }

      // Calculate approximate page number
      const approximatePage = Math.floor((currentPosition / text.length) * pages) + 1;

      chunks.push({
        id: `chunk_${chunkIndex}`,
        text: chunkText.trim(),
        startPosition: currentPosition - chunkText.length,
        endPosition: currentPosition,
        page: Math.min(approximatePage, pages),
        chunkIndex: chunkIndex,
        totalChunks: Math.ceil(text.length / this.chunkSize),
      });

      chunkIndex++;

      // Move position back by overlap amount for next chunk
      if (currentPosition < text.length) {
        currentPosition = Math.max(0, currentPosition - this.chunkOverlap);
      }
    }

    return chunks;
  }

  /**
   * Process PDF file and return chunks
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} - Processing result with chunks and metadata
   */
  async processPDF(filePath) {
    try {
      // Extract text from PDF
      const extractionResult = await this.extractText(filePath);

      // Chunk the text
      const chunks = this.chunkText(extractionResult.text, extractionResult.pages);

      // Get file stats
      const stats = await fs.stat(filePath);

      return {
        filename: path.basename(filePath),
        filePath: filePath,
        fileSize: stats.size,
        pages: extractionResult.pages,
        chunks: chunks,
        metadata: {
          title: extractionResult.info?.Title || path.basename(filePath, '.pdf'),
          author: extractionResult.info?.Author || 'Unknown',
          subject: extractionResult.info?.Subject || '',
          creator: extractionResult.info?.Creator || '',
          producer: extractionResult.info?.Producer || '',
          creationDate: extractionResult.info?.CreationDate || null,
          modificationDate: extractionResult.info?.ModDate || null,
        },
        processingInfo: {
          totalChunks: chunks.length,
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  /**
   * Get text from specific page range
   * @param {string} filePath - Path to the PDF file
   * @param {number} startPage - Start page number (1-based)
   * @param {number} endPage - End page number (1-based)
   * @returns {Promise<string>} - Text from specified pages
   */
  async getPageRange(filePath, startPage, endPage) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer, {
        firstPage: startPage,
        lastPage: endPage,
      });

      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract page range: ${error.message}`);
    }
  }

  /**
   * Get document statistics
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} - Document statistics
   */
  async getDocumentStats(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      const stats = await fs.stat(filePath);

      return {
        filename: path.basename(filePath),
        pages: data.numpages,
        fileSize: stats.size,
        wordCount: data.text.split(/\s+/).length,
        characterCount: data.text.length,
        processingTime: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get document stats: ${error.message}`);
    }
  }

  /**
   * Validate PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<boolean>} - Whether the PDF is valid
   */
  async validatePDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);

      // Basic validation
      if (!data.text || data.text.trim().length === 0) {
        return false;
      }

      if (data.numpages <= 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PDFService();
