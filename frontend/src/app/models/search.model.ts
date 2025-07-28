export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    documentId: string;
    chunkIndex: number;
    page: number;
    text: string;
    startPosition: number;
    endPosition: number;
    totalChunks: number;
    timestamp: string;
  };
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  resultsByPage: PageResult[];
  totalResults: number;
  pagesFound: number;
  searchStats: SearchStats;
}

export interface PageResult {
  page: number;
  results: SearchResult[];
  averageScore: number;
}

export interface SearchStats {
  query: string;
  topK: number;
  threshold: number;
  averageScore: number;
}

export interface GlobalSearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  resultsByDocument: DocumentResult[];
  totalResults: number;
  documentsFound: number;
  searchStats: SearchStats;
}

export interface DocumentResult {
  documentId: string;
  results: SearchResult[];
  averageScore: number;
  pagesFound: number;
}

export interface SearchSuggestions {
  success: boolean;
  query: string;
  suggestions: string[];
  searchResults: number;
}

export interface SearchHighlights {
  success: boolean;
  query: string;
  page: number;
  highlights: Highlight[];
  totalHighlights: number;
}

export interface Highlight {
  id: string;
  text: string;
  score: number;
  startPosition: number;
  endPosition: number;
  chunkIndex: number;
}
