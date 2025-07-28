import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChatMessage } from '../../models/chat.model';
import { Document } from '../../models/document.model';
import * as ChatActions from '../../store/actions/chat.actions';
import * as ChatSelectors from '../../store/selectors/chat.selectors';
import * as DocumentSelectors from '../../store/selectors/document.selectors';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private destroy$ = new Subject<void>();
  newMessage = '';
  currentDocumentId: string | null = null;

  // NgRx observables
  messages$: Observable<ChatMessage[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  currentDocument$: Observable<Document[]>;
  streaming$: Observable<boolean>;
  streamingMessage$: Observable<string>;

  suggestions = [
    'What are the main findings in this document?',
    'Summarize the key points',
    'What methodology was used?',
    'What are the conclusions?',
  ];

  constructor(
    private store: Store,
    private route: ActivatedRoute,
  ) {
    // Initialize with empty observables, will be updated in ngOnInit
    this.messages$ = this.store.select(ChatSelectors.selectCurrentMessages);
    this.loading$ = this.store.select(ChatSelectors.selectCurrentLoading);
    this.error$ = this.store.select(ChatSelectors.selectCurrentError);
    this.currentDocument$ = this.store.select(
      DocumentSelectors.selectAllDocuments,
    );
    this.streaming$ = this.store.select(ChatSelectors.selectCurrentStreaming);
    this.streamingMessage$ = this.store.select(
      ChatSelectors.selectCurrentStreamingMessage,
    );
  }

  ngOnInit() {
    // Get document ID from route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.currentDocumentId = params['id'];
      if (this.currentDocumentId) {
        this.store.dispatch(
          ChatActions.setCurrentDocument({
            documentId: this.currentDocumentId,
          }),
        );
        this.store.dispatch(
          ChatActions.loadChatHistory({ documentId: this.currentDocumentId }),
        );
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(content: string) {
    if (!content.trim() || !this.currentDocumentId) return;

    // Clear input
    this.newMessage = '';

    // Get current messages and dispatch send message action
    this.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      this.store.dispatch(
        ChatActions.sendMessage({
          documentId: this.currentDocumentId!,
          message: content.trim(),
          history: messages,
        }),
      );
    });
  }

  sendSuggestion(suggestion: string) {
    this.newMessage = suggestion;
    this.sendMessage(suggestion);
  }

  onEnterPress(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      // Allow new line with Shift+Enter
      return;
    }
    event.preventDefault();
    this.sendMessage(this.newMessage);
  }

  scrollToBottom() {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      // Handle error
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}
