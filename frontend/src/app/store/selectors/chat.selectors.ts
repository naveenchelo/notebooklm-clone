import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '../reducers/chat.reducer';
import { ChatMessage } from '../../models/chat.model';

export const selectChatState = createFeatureSelector<ChatState>('chat');

// Basic state selectors
export const selectChatMessages = createSelector(
  selectChatState,
  (state) => state.messages,
);

export const selectChatLoading = createSelector(
  selectChatState,
  (state) => state.loading,
);

export const selectChatError = createSelector(
  selectChatState,
  (state) => state.error,
);

export const selectCurrentDocumentId = createSelector(
  selectChatState,
  (state) => state.currentDocumentId,
);

export const selectChatStreaming = createSelector(
  selectChatState,
  (state) => state.streaming,
);

export const selectChatStreamingMessage = createSelector(
  selectChatState,
  (state) => state.streamingMessage,
);

// Document-specific selectors
export const selectMessagesForDocument = (documentId: string) =>
  createSelector(selectChatMessages, (messages) => messages[documentId] || []);

export const selectLoadingForDocument = (documentId: string) =>
  createSelector(selectChatLoading, (loading) => loading[documentId] || false);

export const selectErrorForDocument = (documentId: string) =>
  createSelector(selectChatError, (error) => error[documentId] || null);

export const selectStreamingForDocument = (documentId: string) =>
  createSelector(
    selectChatStreaming,
    (streaming) => streaming[documentId] || false,
  );

export const selectStreamingMessageForDocument = (documentId: string) =>
  createSelector(
    selectChatStreamingMessage,
    (streamingMessage) => streamingMessage[documentId] || '',
  );

// Current document selectors
export const selectCurrentMessages = createSelector(selectChatState, (state) =>
  state.currentDocumentId ? state.messages[state.currentDocumentId] || [] : [],
);

export const selectCurrentLoading = createSelector(selectChatState, (state) =>
  state.currentDocumentId
    ? state.loading[state.currentDocumentId] || false
    : false,
);

export const selectCurrentError = createSelector(selectChatState, (state) =>
  state.currentDocumentId ? state.error[state.currentDocumentId] || null : null,
);

export const selectCurrentStreaming = createSelector(
  selectChatState,
  (state) =>
    state.currentDocumentId
      ? state.streaming[state.currentDocumentId] || false
      : false,
);

export const selectCurrentStreamingMessage = createSelector(
  selectChatState,
  (state) =>
    state.currentDocumentId
      ? state.streamingMessage[state.currentDocumentId] || ''
      : '',
);

// Derived selectors
export const selectMessageCountForDocument = (documentId: string) =>
  createSelector(
    selectMessagesForDocument(documentId),
    (messages) => messages.length,
  );

export const selectUserMessagesForDocument = (documentId: string) =>
  createSelector(selectMessagesForDocument(documentId), (messages) =>
    messages.filter((msg) => msg.role === 'user'),
  );

export const selectAssistantMessagesForDocument = (documentId: string) =>
  createSelector(selectMessagesForDocument(documentId), (messages) =>
    messages.filter((msg) => msg.role === 'assistant'),
  );

export const selectMessagesWithCitationsForDocument = (documentId: string) =>
  createSelector(selectMessagesForDocument(documentId), (messages) =>
    messages.filter((msg) => msg.citations && msg.citations.length > 0),
  );

export const selectTotalCitationsForDocument = (documentId: string) =>
  createSelector(selectMessagesForDocument(documentId), (messages) =>
    messages.reduce(
      (total, msg) => total + (msg.citations ? msg.citations.length : 0),
      0,
    ),
  );

export const selectUniquePagesCitedForDocument = (documentId: string) =>
  createSelector(selectMessagesForDocument(documentId), (messages) => {
    const pages = new Set<number>();
    messages.forEach((msg) => {
      if (msg.citations) {
        msg.citations.forEach((citation) => pages.add(citation.page));
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  });

export const selectChatStatsForDocument = (documentId: string) =>
  createSelector(selectMessagesForDocument(documentId), (messages) => ({
    totalMessages: messages.length,
    userMessages: messages.filter((msg) => msg.role === 'user').length,
    assistantMessages: messages.filter((msg) => msg.role === 'assistant')
      .length,
    messagesWithCitations: messages.filter(
      (msg) => msg.citations && msg.citations.length > 0,
    ).length,
    totalCitations: messages.reduce(
      (total, msg) => total + (msg.citations ? msg.citations.length : 0),
      0,
    ),
    uniquePagesCited: (() => {
      const pages = new Set<number>();
      messages.forEach((msg) => {
        if (msg.citations) {
          msg.citations.forEach((citation) => pages.add(citation.page));
        }
      });
      return Array.from(pages).length;
    })(),
  }));
