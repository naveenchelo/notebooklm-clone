import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DocumentState, adapter } from '../reducers/document.reducer';

export const selectDocumentState =
  createFeatureSelector<DocumentState>('documents');

// Entity selectors
export const {
  selectIds: selectDocumentIds,
  selectEntities: selectDocumentEntities,
  selectAll: selectAllDocuments,
  selectTotal: selectTotalDocuments,
} = adapter.getSelectors(selectDocumentState);

// Custom selectors
export const selectDocumentsLoading = createSelector(
  selectDocumentState,
  (state) => state.loading,
);

export const selectDocumentsError = createSelector(
  selectDocumentState,
  (state) => state.error,
);

export const selectSelectedDocumentId = createSelector(
  selectDocumentState,
  (state) => state.selectedDocumentId,
);

export const selectSelectedDocument = createSelector(
  selectDocumentEntities,
  selectSelectedDocumentId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : null),
);

export const selectUploadProgress = createSelector(
  selectDocumentState,
  (state) => state.uploadProgress,
);

export const selectDocumentById = (id: string) =>
  createSelector(selectDocumentEntities, (entities) => entities[id]);

export const selectDocumentsByStatus = (status: string) =>
  createSelector(selectAllDocuments, (documents) =>
    documents.filter((doc) => doc.status === status),
  );

export const selectProcessedDocuments = createSelector(
  selectAllDocuments,
  (documents) => documents.filter((doc) => doc.status === 'processed'),
);

export const selectPendingDocuments = createSelector(
  selectAllDocuments,
  (documents) => documents.filter((doc) => doc.status === 'pending'),
);

export const selectErrorDocuments = createSelector(
  selectAllDocuments,
  (documents) => documents.filter((doc) => doc.status === 'error'),
);

export const selectDocumentsStats = createSelector(
  selectAllDocuments,
  (documents) => ({
    total: documents.length,
    processed: documents.filter((doc) => doc.status === 'processed').length,
    pending: documents.filter((doc) => doc.status === 'pending').length,
    error: documents.filter((doc) => doc.status === 'error').length,
    totalPages: documents.reduce((sum, doc) => sum + doc.pages, 0),
    totalChunks: documents.reduce((sum, doc) => sum + doc.chunks, 0),
    totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
  }),
);

export const selectRecentDocuments = (limit: number = 5) =>
  createSelector(selectAllDocuments, (documents) => documents.slice(0, limit));

export const selectDocumentsByDateRange = (startDate: Date, endDate: Date) =>
  createSelector(selectAllDocuments, (documents) =>
    documents.filter((doc) => {
      const uploadDate = new Date(doc.uploadedAt);
      return uploadDate >= startDate && uploadDate <= endDate;
    }),
  );
