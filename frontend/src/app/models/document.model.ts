export interface Document {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  pages: number;
  chunks: number;
  metadata: DocumentMetadata;
  processingInfo: ProcessingInfo;
  vectorInfo: VectorInfo;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'processed' | 'error';
  error?: string;
}

export interface DocumentMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface ProcessingInfo {
  totalChunks: number;
  chunkSize: number;
  chunkOverlap: number;
  processedAt: string;
}

export interface VectorInfo {
  totalChunks: number;
  vectorsStored: number;
  results: any[];
  simulated?: boolean;
}

export interface DocumentChunk {
  id: string;
  text: string;
  startPosition: number;
  endPosition: number;
  page: number;
  chunkIndex: number;
  totalChunks: number;
}

export interface DocumentStats {
  filename: string;
  pages: number;
  fileSize: number;
  wordCount: number;
  characterCount: number;
  processingTime: string;
  vectorStats?: any;
}
