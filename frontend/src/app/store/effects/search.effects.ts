import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  mergeMap,
  catchError,
  switchMap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { SearchService } from '../../services/search.service';
import * as SearchActions from '../actions/search.actions';

@Injectable()
export class SearchEffects {
  private actions$ = inject(Actions);
  private searchService = inject(SearchService);

  // Search Document Effect
  searchDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.searchDocument),
      mergeMap(({ documentId, query, topK, threshold }) =>
        this.searchService
          .searchDocument(documentId, query, topK, threshold)
          .pipe(
            map((response) =>
              SearchActions.searchDocumentSuccess({
                response,
                documentId,
              }),
            ),
            catchError((error) =>
              of(
                SearchActions.searchDocumentFailure({
                  error: error.message,
                  documentId,
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // Global Search Effect
  globalSearch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.globalSearch),
      mergeMap(({ query, topK, threshold }) =>
        this.searchService.globalSearch(query, topK, threshold).pipe(
          map((response) => SearchActions.globalSearchSuccess({ response })),
          catchError((error) =>
            of(SearchActions.globalSearchFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  // Debounced Search Effect (for real-time search)
  debouncedSearch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.setSearchQuery),
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(),
      mergeMap(({ query }) => {
        if (!query.trim()) {
          return of(SearchActions.clearSearchResults());
        }
        return of(SearchActions.globalSearch({ query }));
      }),
    ),
  );
}
