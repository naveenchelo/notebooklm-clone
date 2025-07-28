import { createAction, props } from '@ngrx/store';
import {
  SearchResult,
  SearchResponse,
  GlobalSearchResponse,
} from '../../models/search.model';

// Search Document
export const searchDocument = createAction(
  '[Search] Search Document',
  props<{
    documentId: string;
    query: string;
    topK?: number;
    threshold?: number;
  }>(),
);
export const searchDocumentSuccess = createAction(
  '[Search] Search Document Success',
  props<{ response: SearchResponse; documentId: string }>(),
);
export const searchDocumentFailure = createAction(
  '[Search] Search Document Failure',
  props<{ error: string; documentId: string }>(),
);

// Global Search
export const globalSearch = createAction(
  '[Search] Global Search',
  props<{ query: string; topK?: number; threshold?: number }>(),
);
export const globalSearchSuccess = createAction(
  '[Search] Global Search Success',
  props<{ response: GlobalSearchResponse }>(),
);
export const globalSearchFailure = createAction(
  '[Search] Global Search Failure',
  props<{ error: string }>(),
);

// Clear Search Results
export const clearSearchResults = createAction('[Search] Clear Search Results');

// Set Search Query
export const setSearchQuery = createAction(
  '[Search] Set Search Query',
  props<{ query: string }>(),
);

// Set Search Loading
export const setSearchLoading = createAction(
  '[Search] Set Search Loading',
  props<{ loading: boolean }>(),
);

// Set Search Results
export const setSearchResults = createAction(
  '[Search] Set Search Results',
  props<{ results: SearchResult[]; query: string }>(),
);

// Add Search Result
export const addSearchResult = createAction(
  '[Search] Add Search Result',
  props<{ result: SearchResult }>(),
);

// Remove Search Result
export const removeSearchResult = createAction(
  '[Search] Remove Search Result',
  props<{ id: string }>(),
);

// Update Search Result
export const updateSearchResult = createAction(
  '[Search] Update Search Result',
  props<{ id: string; updates: Partial<SearchResult> }>(),
);
