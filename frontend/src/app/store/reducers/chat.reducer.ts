import { createReducer, on } from '@ngrx/store';
import { ChatMessage } from '../../models/chat.model';
import * as ChatActions from '../actions/chat.actions';

export interface ChatState {
  messages: { [documentId: string]: ChatMessage[] };
  loading: { [documentId: string]: boolean };
  error: { [documentId: string]: string | null };
  currentDocumentId: string | null;
  streaming: { [documentId: string]: boolean };
  streamingMessage: { [documentId: string]: string };
}

export const initialState: ChatState = {
  messages: {},
  loading: {},
  error: {},
  currentDocumentId: null,
  streaming: {},
  streamingMessage: {},
};

export const chatReducer = createReducer(
  initialState,

  // Send Message
  on(ChatActions.sendMessage, (state, { documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: true },
    error: { ...state.error, [documentId]: null },
  })),

  on(ChatActions.sendMessageSuccess, (state, { response, documentId }) => {
    const currentMessages = state.messages[documentId] || [];
    return {
      ...state,
      messages: {
        ...state.messages,
        [documentId]: [...currentMessages, response],
      },
      loading: { ...state.loading, [documentId]: false },
      error: { ...state.error, [documentId]: null },
    };
  }),

  on(ChatActions.sendMessageFailure, (state, { error, documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: false },
    error: { ...state.error, [documentId]: error },
  })),

  // Stream Message
  on(ChatActions.streamMessage, (state, { documentId }) => ({
    ...state,
    streaming: { ...state.streaming, [documentId]: true },
    streamingMessage: { ...state.streamingMessage, [documentId]: '' },
    error: { ...state.error, [documentId]: null },
  })),

  on(ChatActions.streamMessageChunk, (state, { chunk, documentId }) => ({
    ...state,
    streamingMessage: {
      ...state.streamingMessage,
      [documentId]: (state.streamingMessage[documentId] || '') + chunk,
    },
  })),

  on(ChatActions.streamMessageComplete, (state, { response, documentId }) => {
    const currentMessages = state.messages[documentId] || [];
    return {
      ...state,
      messages: {
        ...state.messages,
        [documentId]: [...currentMessages, response],
      },
      streaming: { ...state.streaming, [documentId]: false },
      streamingMessage: { ...state.streamingMessage, [documentId]: '' },
      error: { ...state.error, [documentId]: null },
    };
  }),

  on(ChatActions.streamMessageFailure, (state, { error, documentId }) => ({
    ...state,
    streaming: { ...state.streaming, [documentId]: false },
    streamingMessage: { ...state.streamingMessage, [documentId]: '' },
    error: { ...state.error, [documentId]: error },
  })),

  // Load Chat History
  on(ChatActions.loadChatHistory, (state, { documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: true },
    error: { ...state.error, [documentId]: null },
  })),

  on(ChatActions.loadChatHistorySuccess, (state, { history, documentId }) => ({
    ...state,
    messages: { ...state.messages, [documentId]: history },
    loading: { ...state.loading, [documentId]: false },
    error: { ...state.error, [documentId]: null },
  })),

  on(ChatActions.loadChatHistoryFailure, (state, { error, documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: false },
    error: { ...state.error, [documentId]: error },
  })),

  // Clear Chat History
  on(ChatActions.clearChatHistory, (state, { documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: true },
    error: { ...state.error, [documentId]: null },
  })),

  on(ChatActions.clearChatHistorySuccess, (state, { documentId }) => ({
    ...state,
    messages: { ...state.messages, [documentId]: [] },
    loading: { ...state.loading, [documentId]: false },
    error: { ...state.error, [documentId]: null },
  })),

  on(ChatActions.clearChatHistoryFailure, (state, { error, documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: false },
    error: { ...state.error, [documentId]: error },
  })),

  // Add Message to History
  on(ChatActions.addMessageToHistory, (state, { message, documentId }) => {
    const currentMessages = state.messages[documentId] || [];
    return {
      ...state,
      messages: {
        ...state.messages,
        [documentId]: [...currentMessages, message],
      },
    };
  }),

  // Set Chat Loading
  on(ChatActions.setChatLoading, (state, { loading, documentId }) => ({
    ...state,
    loading: { ...state.loading, [documentId]: loading },
  })),

  // Set Current Document
  on(ChatActions.setCurrentDocument, (state, { documentId }) => ({
    ...state,
    currentDocumentId: documentId,
  })),

  // Clear Current Document
  on(ChatActions.clearCurrentDocument, (state) => ({
    ...state,
    currentDocumentId: null,
  })),
);
