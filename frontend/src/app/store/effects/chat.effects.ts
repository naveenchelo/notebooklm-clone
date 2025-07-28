import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import * as ChatActions from '../actions/chat.actions';

@Injectable()
export class ChatEffects {
  private actions$ = inject(Actions);
  private chatService = inject(ChatService);

  // Send Message Effect
  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      mergeMap(({ documentId, message, history }) =>
        this.chatService.sendMessage(documentId, message, history).pipe(
          map((response) =>
            ChatActions.sendMessageSuccess({
              response: response.response,
              documentId,
            }),
          ),
          catchError((error) =>
            of(
              ChatActions.sendMessageFailure({
                error: error.message,
                documentId,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Stream Message Effect
  streamMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.streamMessage),
      mergeMap(({ documentId, message, history }) =>
        this.chatService.streamMessage(documentId, message, history).pipe(
          map((response) => {
            // Handle streaming response
            if (response.done) {
              // Stream complete
              const finalMessage = this.chatService.createMessage(
                'assistant',
                response.content || '',
                response.citations,
              );
              return ChatActions.streamMessageComplete({
                response: finalMessage,
                documentId,
              });
            } else {
              // Stream chunk
              return ChatActions.streamMessageChunk({
                chunk: response.content || '',
                documentId,
              });
            }
          }),
          catchError((error) =>
            of(
              ChatActions.streamMessageFailure({
                error: error.message,
                documentId,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Load Chat History Effect
  loadChatHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadChatHistory),
      mergeMap(({ documentId, limit, offset }) =>
        this.chatService.getChatHistory(documentId, limit, offset).pipe(
          map((response) =>
            ChatActions.loadChatHistorySuccess({
              history: response.history,
              documentId,
              total: response.total,
            }),
          ),
          catchError((error) =>
            of(
              ChatActions.loadChatHistoryFailure({
                error: error.message,
                documentId,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Clear Chat History Effect
  clearChatHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.clearChatHistory),
      mergeMap(({ documentId }) =>
        this.chatService.clearChatHistory(documentId).pipe(
          map(() => ChatActions.clearChatHistorySuccess({ documentId })),
          catchError((error) =>
            of(
              ChatActions.clearChatHistoryFailure({
                error: error.message,
                documentId,
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
