import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  SearchResponse,
  GlobalSearchResponse,
  SearchSuggestions,
  SearchHighlights,
} from '../models/search.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private apiService: ApiService) {}

  /**
   * Search within a specific document
   */
  searchDocument(
    documentId: string,
    query: string,
    topK: number = 10,
    threshold: number = 0.7,
  ): Observable<SearchResponse> {
    return this.apiService.post<SearchResponse>(`/search/${documentId}`, {
      query,
      topK,
      threshold,
    });
  }

  /**
   * Global search across all documents
   */
  globalSearch(
    query: string,
    topK: number = 10,
    threshold: number = 0.7,
  ): Observable<GlobalSearchResponse> {
    return this.apiService.post<GlobalSearchResponse>('/search/global', {
      query,
      topK,
      threshold,
    });
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(
    documentId: string,
    query: string,
  ): Observable<SearchSuggestions> {
    return this.apiService.get<SearchSuggestions>(
      `/search/${documentId}/suggestions`,
      {
        query,
      },
    );
  }

  /**
   * Get page highlights
   */
  getPageHighlights(
    documentId: string,
    query: string,
    page: number,
  ): Observable<SearchHighlights> {
    return this.apiService.get<SearchHighlights>(
      `/search/${documentId}/highlights`,
      {
        query,
        page,
      },
    );
  }

  /**
   * Get search statistics
   */
  getSearchStats(): Observable<{ success: boolean; stats: any }> {
    return this.apiService.get<{ success: boolean; stats: any }>(
      '/search/stats',
    );
  }

  /**
   * Highlight text in content
   */
  highlightText(content: string, highlights: any[]): string {
    if (!highlights || highlights.length === 0) {
      return content;
    }

    let highlightedContent = content;

    // Sort highlights by position to avoid conflicts
    const sortedHighlights = highlights.sort(
      (a, b) => a.startPosition - b.startPosition,
    );

    // Apply highlights in reverse order to maintain positions
    for (let i = sortedHighlights.length - 1; i >= 0; i--) {
      const highlight = sortedHighlights[i];
      const before = highlightedContent.substring(0, highlight.startPosition);
      const highlighted = highlightedContent.substring(
        highlight.startPosition,
        highlight.endPosition,
      );
      const after = highlightedContent.substring(highlight.endPosition);

      highlightedContent =
        before +
        `<mark class="search-highlight" data-score="${highlight.score}">${highlighted}</mark>` +
        after;
    }

    return highlightedContent;
  }

  /**
   * Extract search terms from query
   */
  extractSearchTerms(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .map((term) => term.replace(/[^\w]/g, ''));
  }

  /**
   * Calculate search relevance score
   */
  calculateRelevanceScore(score: number): string {
    if (score >= 0.9) return 'Very High';
    if (score >= 0.8) return 'High';
    if (score >= 0.7) return 'Medium';
    if (score >= 0.6) return 'Low';
    return 'Very Low';
  }

  /**
   * Group search results by page
   */
  groupResultsByPage(results: any[]): any[] {
    const grouped = results.reduce((acc: any, result) => {
      const page = result.metadata.page;
      if (!acc[page]) {
        acc[page] = [];
      }
      acc[page].push(result);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([page, pageResults]) => ({
        page: parseInt(page),
        results: pageResults as any[],
        averageScore:
          (pageResults as any[]).reduce(
            (sum: number, r: any) => sum + r.score,
            0,
          ) / (pageResults as any[]).length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }
}
