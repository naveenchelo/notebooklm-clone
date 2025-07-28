import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ChatMessage,
  ChatResponse,
  ChatHistory,
  ChatSuggestions,
} from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private apiService: ApiService) {}

  /**
   * Send a chat message
   */
  sendMessage(
    documentId: string,
    message: string,
    history: ChatMessage[] = [],
  ): Observable<ChatResponse> {
    return this.apiService.post<ChatResponse>(`/chat/${documentId}`, {
      message,
      history,
    });
  }

  /**
   * Stream chat response
   */
  streamMessage(
    documentId: string,
    message: string,
    history: ChatMessage[] = [],
  ): Observable<any> {
    return this.apiService.stream<any>(`/chat/${documentId}/stream`, {
      message,
      history,
    });
  }

  /**
   * Get chat history
   */
  getChatHistory(
    documentId: string,
    limit: number = 50,
    offset: number = 0,
  ): Observable<ChatHistory> {
    return this.apiService.get<ChatHistory>(`/chat/${documentId}/history`, {
      limit,
      offset,
    });
  }

  /**
   * Clear chat history
   */
  clearChatHistory(
    documentId: string,
  ): Observable<{ success: boolean; message: string; documentId: string }> {
    return this.apiService.delete<{
      success: boolean;
      message: string;
      documentId: string;
    }>(`/chat/${documentId}`);
  }

  /**
   * Get chat suggestions
   */
  getChatSuggestions(documentId: string): Observable<ChatSuggestions> {
    return this.apiService.get<ChatSuggestions>(
      `/chat/${documentId}/suggestions`,
    );
  }

  /**
   * Create a new chat message
   */
  createMessage(
    role: 'user' | 'assistant',
    content: string,
    citations?: any[],
  ): ChatMessage {
    return {
      id: Date.now().toString(),
      role,
      content,
      citations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format chat message for display
   */
  formatMessage(message: ChatMessage): string {
    let formatted = message.content;

    // Add citations if available
    if (message.citations && message.citations.length > 0) {
      formatted += '\n\n**Citations:**\n';
      message.citations.forEach((citation, index) => {
        formatted += `${index + 1}. Page ${citation.page}: ${citation.text}\n`;
      });
    }

    return formatted;
  }

  /**
   * Extract page numbers from citations
   */
  extractPageNumbers(message: ChatMessage): number[] {
    if (!message.citations) return [];

    return [
      ...new Set(message.citations.map((citation) => citation.page)),
    ].sort((a, b) => a - b);
  }

  /**
   * Check if message has citations
   */
  hasCitations(message: ChatMessage): boolean {
    return !!(message.citations && message.citations.length > 0);
  }

  /**
   * Get citation count
   */
  getCitationCount(message: ChatMessage): number {
    return message.citations ? message.citations.length : 0;
  }
}
