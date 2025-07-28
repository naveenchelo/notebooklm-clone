import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SearchState } from '../reducers/search.reducer';
import { SearchResult } from '../../models/search.model';

export const selectSearchState = createFeatureSelector<SearchState>('search');

// Basic state selectors
export const selectSearchResults = createSelector(
  selectSearchState,
  (state) => state.results,
);

export const selectSearchQuery = createSelector(
  selectSearchState,
  (state) => state.query,
);

export const selectSearchLoading = createSelector(
  selectSearchState,
  (state) => state.loading,
);

export const selectSearchError = createSelector(
  selectSearchState,
  (state) => state.error,
);

export const selectCurrentSearchDocumentId = createSelector(
  selectSearchState,
  (state) => state.currentDocumentId,
);

// Derived selectors
export const selectSearchResultsCount = createSelector(
  selectSearchResults,
  (results) => results.length,
);

export const selectSearchResultsByScore = createSelector(
  selectSearchResults,
  (results) => [...results].sort((a, b) => b.score - a.score),
);

export const selectHighRelevanceResults = createSelector(
  selectSearchResults,
  (results) => results.filter((result) => result.score >= 0.8),
);

export const selectMediumRelevanceResults = createSelector(
  selectSearchResults,
  (results) =>
    results.filter((result) => result.score >= 0.6 && result.score < 0.8),
);

export const selectLowRelevanceResults = createSelector(
  selectSearchResults,
  (results) => results.filter((result) => result.score < 0.6),
);

export const selectSearchResultsByPage = createSelector(
  selectSearchResults,
  (results) => {
    const grouped = results.reduce(
      (acc, result) => {
        const page = result.metadata.page;
        if (!acc[page]) {
          acc[page] = [];
        }
        acc[page].push(result);
        return acc;
      },
      {} as { [page: number]: SearchResult[] },
    );

    return Object.entries(grouped)
      .map(([page, pageResults]) => ({
        page: parseInt(page),
        results: pageResults,
        averageScore:
          pageResults.reduce((sum, r) => sum + r.score, 0) / pageResults.length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  },
);

export const selectSearchResultsByDocument = createSelector(
  selectSearchResults,
  (results) => {
    const grouped = results.reduce(
      (acc, result) => {
        const documentId = result.metadata.documentId;
        if (!acc[documentId]) {
          acc[documentId] = [];
        }
        acc[documentId].push(result);
        return acc;
      },
      {} as { [documentId: string]: SearchResult[] },
    );

    return Object.entries(grouped)
      .map(([documentId, docResults]) => ({
        documentId,
        results: docResults,
        averageScore:
          docResults.reduce((sum, r) => sum + r.score, 0) / docResults.length,
        pagesFound: new Set(docResults.map((r) => r.metadata.page)).size,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  },
);

export const selectUniquePagesInResults = createSelector(
  selectSearchResults,
  (results) =>
    [...new Set(results.map((result) => result.metadata.page))].sort(
      (a, b) => a - b,
    ),
);

export const selectUniqueDocumentsInResults = createSelector(
  selectSearchResults,
  (results) => [
    ...new Set(results.map((result) => result.metadata.documentId)),
  ],
);

export const selectSearchStats = createSelector(
  selectSearchResults,
  selectSearchQuery,
  (results, query) => ({
    query,
    totalResults: results.length,
    averageScore:
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0,
    maxScore: results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0,
    minScore: results.length > 0 ? Math.min(...results.map((r) => r.score)) : 0,
    uniquePages: new Set(results.map((r) => r.metadata.page)).size,
    uniqueDocuments: new Set(results.map((r) => r.metadata.documentId)).size,
    highRelevanceCount: results.filter((r) => r.score >= 0.8).length,
    mediumRelevanceCount: results.filter((r) => r.score >= 0.6 && r.score < 0.8)
      .length,
    lowRelevanceCount: results.filter((r) => r.score < 0.6).length,
  }),
);

export const selectSearchResultById = (id: string) =>
  createSelector(selectSearchResults, (results) =>
    results.find((result) => result.id === id),
  );

export const selectSearchResultsForPage = (page: number) =>
  createSelector(selectSearchResults, (results) =>
    results.filter((result) => result.metadata.page === page),
  );

export const selectSearchResultsForDocument = (documentId: string) =>
  createSelector(selectSearchResults, (results) =>
    results.filter((result) => result.metadata.documentId === documentId),
  );

export const selectSearchResultsAboveThreshold = (threshold: number) =>
  createSelector(selectSearchResults, (results) =>
    results.filter((result) => result.score >= threshold),
  );

export const selectSearchResultsBelowThreshold = (threshold: number) =>
  createSelector(selectSearchResults, (results) =>
    results.filter((result) => result.score < threshold),
  );
