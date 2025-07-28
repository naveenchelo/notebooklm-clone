import { createReducer, on } from '@ngrx/store';
import { SearchResult } from '../../models/search.model';
import * as SearchActions from '../actions/search.actions';

export interface SearchState {
  results: SearchResult[];
  query: string;
  loading: boolean;
  error: string | null;
  currentDocumentId: string | null;
}

export const initialState: SearchState = {
  results: [],
  query: '',
  loading: false,
  error: null,
  currentDocumentId: null,
};

export const searchReducer = createReducer(
  initialState,

  // Search Document
  on(SearchActions.searchDocument, (state, { documentId, query }) => ({
    ...state,
    loading: true,
    error: null,
    query,
    currentDocumentId: documentId,
  })),

  on(SearchActions.searchDocumentSuccess, (state, { response }) => ({
    ...state,
    results: response.results,
    loading: false,
    error: null,
  })),

  on(SearchActions.searchDocumentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Global Search
  on(SearchActions.globalSearch, (state, { query }) => ({
    ...state,
    loading: true,
    error: null,
    query,
    currentDocumentId: null,
  })),

  on(SearchActions.globalSearchSuccess, (state, { response }) => ({
    ...state,
    results: response.results,
    loading: false,
    error: null,
  })),

  on(SearchActions.globalSearchFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear Search Results
  on(SearchActions.clearSearchResults, (state) => ({
    ...state,
    results: [],
    query: '',
    error: null,
  })),

  // Set Search Query
  on(SearchActions.setSearchQuery, (state, { query }) => ({
    ...state,
    query,
  })),

  // Set Search Loading
  on(SearchActions.setSearchLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),

  // Set Search Results
  on(SearchActions.setSearchResults, (state, { results, query }) => ({
    ...state,
    results,
    query,
  })),

  // Add Search Result
  on(SearchActions.addSearchResult, (state, { result }) => ({
    ...state,
    results: [...state.results, result],
  })),

  // Remove Search Result
  on(SearchActions.removeSearchResult, (state, { id }) => ({
    ...state,
    results: state.results.filter((result) => result.id !== id),
  })),

  // Update Search Result
  on(SearchActions.updateSearchResult, (state, { id, updates }) => ({
    ...state,
    results: state.results.map((result) =>
      result.id === id ? { ...result, ...updates } : result,
    ),
  })),
);
