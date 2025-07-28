export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  searchResults?: number;
}

export interface Citation {
  page: number;
  text: string;
  score: number;
}

export interface ChatResponse {
  success: boolean;
  response: ChatMessage;
  context: {
    chunksFound: number;
    averageScore: number;
  };
}

export interface ChatHistory {
  success: boolean;
  history: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatSuggestion {
  text: string;
  category?: string;
}

export interface ChatSuggestions {
  success: boolean;
  suggestions: string[];
  documentStats: any;
}
