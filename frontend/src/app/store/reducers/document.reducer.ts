import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Document } from '../../models/document.model';
import * as DocumentActions from '../actions/document.actions';

export interface DocumentState extends EntityState<Document> {
  loading: boolean;
  error: string | null;
  selectedDocumentId: string | null;
  uploadProgress: { [key: string]: number };
}

export const adapter: EntityAdapter<Document> = createEntityAdapter<Document>({
  selectId: (document: Document) => document.id,
  sortComparer: (a: Document, b: Document) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
});

export const initialState: DocumentState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedDocumentId: null,
  uploadProgress: {},
});

export const documentReducer = createReducer(
  initialState,

  // Load Documents
  on(DocumentActions.loadDocuments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(DocumentActions.loadDocumentsSuccess, (state, { documents }) => ({
    ...adapter.setAll(documents, state),
    loading: false,
    error: null,
  })),

  on(DocumentActions.loadDocumentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Single Document
  on(DocumentActions.loadDocument, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(DocumentActions.loadDocumentSuccess, (state, { document }) => ({
    ...adapter.upsertOne(document, state),
    loading: false,
    error: null,
  })),

  on(DocumentActions.loadDocumentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Upload Document
  on(DocumentActions.uploadDocument, (state, { file }) => ({
    ...state,
    loading: true,
    error: null,
    uploadProgress: {
      ...state.uploadProgress,
      [file.name]: 0,
    },
  })),

  on(DocumentActions.uploadDocumentSuccess, (state, { document }) => ({
    ...adapter.addOne(document, state),
    loading: false,
    error: null,
    uploadProgress: {
      ...state.uploadProgress,
      [document.filename]: 100,
    },
  })),

  on(DocumentActions.uploadDocumentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Upload Multiple Documents
  on(DocumentActions.uploadMultipleDocuments, (state, { files }) => ({
    ...state,
    loading: true,
    error: null,
    uploadProgress: {
      ...state.uploadProgress,
      ...files.reduce((acc, file) => ({ ...acc, [file.name]: 0 }), {}),
    },
  })),

  on(
    DocumentActions.uploadMultipleDocumentsSuccess,
    (state, { documents }) => ({
      ...adapter.addMany(documents, state),
      loading: false,
      error: null,
      uploadProgress: {
        ...state.uploadProgress,
        ...documents.reduce(
          (acc, doc) => ({ ...acc, [doc.filename]: 100 }),
          {},
        ),
      },
    }),
  ),

  on(DocumentActions.uploadMultipleDocumentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Document
  on(DocumentActions.deleteDocument, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(DocumentActions.deleteDocumentSuccess, (state, { id }) => ({
    ...adapter.removeOne(id, state),
    loading: false,
    error: null,
    selectedDocumentId:
      state.selectedDocumentId === id ? null : state.selectedDocumentId,
  })),

  on(DocumentActions.deleteDocumentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear Documents
  on(DocumentActions.clearDocuments, (state) => ({
    ...adapter.removeAll(state),
    loading: false,
    error: null,
    selectedDocumentId: null,
    uploadProgress: {},
  })),

  // Set Selected Document
  on(DocumentActions.setSelectedDocument, (state, { document }) => ({
    ...state,
    selectedDocumentId: document?.id || null,
  })),

  // Update Document Status
  on(DocumentActions.updateDocumentStatus, (state, { id, status, error }) => {
    const document = state.entities[id];
    if (!document) return state;

    return adapter.updateOne(
      {
        id,
        changes: {
          status,
          error: error || undefined,
        },
      },
      state,
    );
  }),
);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  adapter.getSelectors();
