/**
 * Document Model
 * Represents a PDF document in the system
 */
class Document {
  constructor(data = {}) {
    this.id = data.id || null;
    this.filename = data.filename || '';
    this.originalName = data.originalName || '';
    this.filePath = data.filePath || '';
    this.fileSize = data.fileSize || 0;
    this.pages = data.pages || 0;
    this.chunks = data.chunks || 0;
    this.metadata = data.metadata || {
      title: '',
      author: '',
      subject: '',
      creator: '',
      producer: '',
      creationDate: null,
      modificationDate: null,
    };
    this.processingInfo = data.processingInfo || {
      totalChunks: 0,
      chunkSize: 1000,
      chunkOverlap: 200,
      processedAt: null,
    };
    this.vectorInfo = data.vectorInfo || {
      totalChunks: 0,
      vectorsStored: 0,
      results: [],
    };
    this.uploadedAt = data.uploadedAt || new Date().toISOString();
    this.status = data.status || 'pending'; // pending, processing, processed, error
    this.error = data.error || null;
  }

  /**
   * Create a document from file upload data
   */
  static fromUpload(file, documentId) {
    return new Document({
      id: documentId,
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  /**
   * Update document with processing results
   */
  updateWithProcessing(processingResult, vectorResult) {
    this.pages = processingResult.pages;
    this.chunks = processingResult.chunks.length;
    this.metadata = processingResult.metadata;
    this.processingInfo = processingResult.processingInfo;
    this.vectorInfo = vectorResult;
    this.status = 'processed';
    return this;
  }

  /**
   * Mark document as having an error
   */
  markAsError(error) {
    this.status = 'error';
    this.error = error;
    return this;
  }

  /**
   * Get document summary for API responses
   */
  toSummary() {
    return {
      id: this.id,
      filename: this.filename,
      pages: this.pages,
      chunks: this.chunks,
      fileSize: this.fileSize,
      uploadedAt: this.uploadedAt,
      metadata: this.metadata,
      status: this.status,
    };
  }

  /**
   * Get full document details
   */
  toFullDetails() {
    return {
      id: this.id,
      filename: this.filename,
      pages: this.pages,
      chunks: this.chunks,
      fileSize: this.fileSize,
      uploadedAt: this.uploadedAt,
      metadata: this.metadata,
      processingInfo: this.processingInfo,
      vectorInfo: this.vectorInfo,
      status: this.status,
      error: this.error,
    };
  }
}

module.exports = Document;
