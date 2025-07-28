import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Document,
  DocumentChunk,
  DocumentStats,
} from '../models/document.model';

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  total: number;
}

export interface DocumentResponse {
  success: boolean;
  document: Document;
}

export interface DocumentContentResponse {
  success: boolean;
  documentId: string;
  chunks: DocumentChunk[];
  totalChunks: number;
}

export interface PageContentResponse {
  success: boolean;
  documentId: string;
  pageNumber: number;
  content: string;
  totalPages: number;
}

export interface DocumentStatsResponse {
  success: boolean;
  documentId: string;
  stats: DocumentStats;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private apiService: ApiService) {}

  /**
   * Upload a PDF document
   */
  uploadDocument(file: File): Observable<DocumentResponse> {
    return this.apiService.upload<DocumentResponse>('/documents/upload', file);
  }

  /**
   * Upload multiple PDF documents
   */
  uploadMultipleDocuments(files: File[]): Observable<DocumentResponse[]> {
    return this.apiService.uploadMultiple<DocumentResponse[]>(
      '/documents/upload',
      files,
    );
  }

  /**
   * Get all documents
   */
  getDocuments(): Observable<DocumentsResponse> {
    return this.apiService.get<DocumentsResponse>('/documents');
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): Observable<DocumentResponse> {
    return this.apiService.get<DocumentResponse>(`/documents/${id}`);
  }

  /**
   * Get document content (chunks)
   */
  getDocumentContent(id: string): Observable<DocumentContentResponse> {
    return this.apiService.get<DocumentContentResponse>(
      `/documents/${id}/content`,
    );
  }

  /**
   * Get specific page content
   */
  getPageContent(
    id: string,
    pageNumber: number,
  ): Observable<PageContentResponse> {
    return this.apiService.get<PageContentResponse>(
      `/documents/${id}/page/${pageNumber}`,
    );
  }

  /**
   * Delete document
   */
  deleteDocument(
    id: string,
  ): Observable<{ success: boolean; message: string; documentId: string }> {
    return this.apiService.delete<{
      success: boolean;
      message: string;
      documentId: string;
    }>(`/documents/${id}`);
  }

  /**
   * Get document statistics
   */
  getDocumentStats(id: string): Observable<DocumentStatsResponse> {
    return this.apiService.get<DocumentStatsResponse>(`/documents/${id}/stats`);
  }

  /**
   * Get document file URL
   */
  getDocumentFileUrl(document: Document): string {
    return `${this.apiService['baseUrl'].replace('/api', '')}/uploads/${document.filename}`;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Only PDF files are allowed' };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 50MB' };
    }

    return { isValid: true };
  }
}
