import { createAction, props } from '@ngrx/store';
import { ChatMessage } from '../../models/chat.model';

// Send Message
export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ documentId: string; message: string; history: ChatMessage[] }>(),
);
export const sendMessageSuccess = createAction(
  '[Chat] Send Message Success',
  props<{ response: ChatMessage; documentId: string }>(),
);
export const sendMessageFailure = createAction(
  '[Chat] Send Message Failure',
  props<{ error: string; documentId: string }>(),
);

// Stream Message
export const streamMessage = createAction(
  '[Chat] Stream Message',
  props<{ documentId: string; message: string; history: ChatMessage[] }>(),
);
export const streamMessageChunk = createAction(
  '[Chat] Stream Message Chunk',
  props<{ chunk: string; documentId: string }>(),
);
export const streamMessageComplete = createAction(
  '[Chat] Stream Message Complete',
  props<{ response: ChatMessage; documentId: string }>(),
);
export const streamMessageFailure = createAction(
  '[Chat] Stream Message Failure',
  props<{ error: string; documentId: string }>(),
);

// Load Chat History
export const loadChatHistory = createAction(
  '[Chat] Load Chat History',
  props<{ documentId: string; limit?: number; offset?: number }>(),
);
export const loadChatHistorySuccess = createAction(
  '[Chat] Load Chat History Success',
  props<{ history: ChatMessage[]; documentId: string; total: number }>(),
);
export const loadChatHistoryFailure = createAction(
  '[Chat] Load Chat History Failure',
  props<{ error: string; documentId: string }>(),
);

// Clear Chat History
export const clearChatHistory = createAction(
  '[Chat] Clear Chat History',
  props<{ documentId: string }>(),
);
export const clearChatHistorySuccess = createAction(
  '[Chat] Clear Chat History Success',
  props<{ documentId: string }>(),
);
export const clearChatHistoryFailure = createAction(
  '[Chat] Clear Chat History Failure',
  props<{ error: string; documentId: string }>(),
);

// Add Message to History
export const addMessageToHistory = createAction(
  '[Chat] Add Message to History',
  props<{ message: ChatMessage; documentId: string }>(),
);

// Set Chat Loading
export const setChatLoading = createAction(
  '[Chat] Set Chat Loading',
  props<{ loading: boolean; documentId: string }>(),
);

// Set Current Document
export const setCurrentDocument = createAction(
  '[Chat] Set Current Document',
  props<{ documentId: string }>(),
);

// Clear Current Document
export const clearCurrentDocument = createAction(
  '[Chat] Clear Current Document',
);
