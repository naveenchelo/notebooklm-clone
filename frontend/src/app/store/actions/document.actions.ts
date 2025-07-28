import { createAction, props } from '@ngrx/store';
import { Document } from '../../models/document.model';

// Load Documents
export const loadDocuments = createAction('[Document] Load Documents');
export const loadDocumentsSuccess = createAction(
  '[Document] Load Documents Success',
  props<{ documents: Document[] }>(),
);
export const loadDocumentsFailure = createAction(
  '[Document] Load Documents Failure',
  props<{ error: string }>(),
);

// Load Single Document
export const loadDocument = createAction(
  '[Document] Load Document',
  props<{ id: string }>(),
);
export const loadDocumentSuccess = createAction(
  '[Document] Load Document Success',
  props<{ document: Document }>(),
);
export const loadDocumentFailure = createAction(
  '[Document] Load Document Failure',
  props<{ error: string }>(),
);

// Upload Document
export const uploadDocument = createAction(
  '[Document] Upload Document',
  props<{ file: File }>(),
);
export const uploadDocumentSuccess = createAction(
  '[Document] Upload Document Success',
  props<{ document: Document }>(),
);
export const uploadDocumentFailure = createAction(
  '[Document] Upload Document Failure',
  props<{ error: string }>(),
);

// Upload Multiple Documents
export const uploadMultipleDocuments = createAction(
  '[Document] Upload Multiple Documents',
  props<{ files: File[] }>(),
);
export const uploadMultipleDocumentsSuccess = createAction(
  '[Document] Upload Multiple Documents Success',
  props<{ documents: Document[] }>(),
);
export const uploadMultipleDocumentsFailure = createAction(
  '[Document] Upload Multiple Documents Failure',
  props<{ error: string }>(),
);

// Delete Document
export const deleteDocument = createAction(
  '[Document] Delete Document',
  props<{ id: string }>(),
);
export const deleteDocumentSuccess = createAction(
  '[Document] Delete Document Success',
  props<{ id: string }>(),
);
export const deleteDocumentFailure = createAction(
  '[Document] Delete Document Failure',
  props<{ error: string }>(),
);

// Clear Documents
export const clearDocuments = createAction('[Document] Clear Documents');

// Set Selected Document
export const setSelectedDocument = createAction(
  '[Document] Set Selected Document',
  props<{ document: Document | null }>(),
);

// Update Document Status
export const updateDocumentStatus = createAction(
  '[Document] Update Document Status',
  props<{
    id: string;
    status: 'pending' | 'processing' | 'processed' | 'error';
    error?: string;
  }>(),
);
