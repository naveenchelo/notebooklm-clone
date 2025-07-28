import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { DocumentService } from '../../services/document.service';
import * as DocumentActions from '../actions/document.actions';

@Injectable()
export class DocumentEffects {
  private actions$ = inject(Actions);
  private documentService = inject(DocumentService);

  // Load Documents Effect
  loadDocuments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.loadDocuments),
      mergeMap(() =>
        this.documentService.getDocuments().pipe(
          map((response) =>
            DocumentActions.loadDocumentsSuccess({
              documents: response.documents,
            }),
          ),
          catchError((error) =>
            of(DocumentActions.loadDocumentsFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  // Load Single Document Effect
  loadDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.loadDocument),
      mergeMap(({ id }) =>
        this.documentService.getDocument(id).pipe(
          map((response) =>
            DocumentActions.loadDocumentSuccess({
              document: response.document,
            }),
          ),
          catchError((error) =>
            of(DocumentActions.loadDocumentFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  // Upload Document Effect
  uploadDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.uploadDocument),
      mergeMap(({ file }) => {
        // Validate file first
        const validation = this.documentService.validateFile(file);
        if (!validation.isValid) {
          return of(
            DocumentActions.uploadDocumentFailure({
              error: validation.error || 'Invalid file',
            }),
          );
        }

        return this.documentService.uploadDocument(file).pipe(
          map((response) =>
            DocumentActions.uploadDocumentSuccess({
              document: response.document,
            }),
          ),
          catchError((error) =>
            of(DocumentActions.uploadDocumentFailure({ error: error.message })),
          ),
        );
      }),
    ),
  );

  // Upload Multiple Documents Effect
  uploadMultipleDocuments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.uploadMultipleDocuments),
      mergeMap(({ files }) => {
        // Validate all files first
        const invalidFiles = files.filter(
          (file) => !this.documentService.validateFile(file).isValid,
        );
        if (invalidFiles.length > 0) {
          return of(
            DocumentActions.uploadMultipleDocumentsFailure({
              error: `Invalid files: ${invalidFiles.map((f) => f.name).join(', ')}`,
            }),
          );
        }

        // For now, upload files sequentially
        // In a real app, you might want to upload them in parallel
        return this.documentService.uploadMultipleDocuments(files).pipe(
          map((responses) =>
            DocumentActions.uploadMultipleDocumentsSuccess({
              documents: responses.map((r) => r.document),
            }),
          ),
          catchError((error) =>
            of(
              DocumentActions.uploadMultipleDocumentsFailure({
                error: error.message,
              }),
            ),
          ),
        );
      }),
    ),
  );

  // Delete Document Effect
  deleteDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.deleteDocument),
      mergeMap(({ id }) =>
        this.documentService.deleteDocument(id).pipe(
          map(() => DocumentActions.deleteDocumentSuccess({ id })),
          catchError((error) =>
            of(DocumentActions.deleteDocumentFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
