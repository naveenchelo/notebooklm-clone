import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  citations?: Array<{ page: number; text: string }>;
  isLoading?: boolean;
}

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
export class Chat {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;

  suggestions = [
    'What are the main findings in this document?',
    'Summarize the key points',
    'What methodology was used?',
    'What are the conclusions?',
  ];

  ngOnInit() {
    // Add a welcome message
    this.messages.push({
      id: 'welcome',
      content:
        "Hello! I'm here to help you understand your documents. Ask me anything about the content you've uploaded.",
      sender: 'ai',
      timestamp: new Date(),
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(content: string) {
    if (!content.trim() || this.isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    // Clear input
    this.newMessage = '';

    // Add AI response placeholder
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true,
    };
    this.messages.push(aiMessage);

    this.isTyping = true;

    // Simulate AI response
    setTimeout(() => {
      this.simulateAIResponse(aiMessage);
    }, 1000);
  }

  private simulateAIResponse(message: ChatMessage) {
    message.isLoading = false;
    message.content = this.generateMockResponse();

    // Add some citations
    if (Math.random() > 0.5) {
      message.citations = [
        { page: 1, text: 'Introduction section' },
        { page: 3, text: 'Methodology overview' },
      ];
    }

    this.isTyping = false;
  }

  private generateMockResponse(): string {
    const responses = [
      'Based on the document, I can see that the main findings focus on...',
      'The document outlines several key points that are worth noting...',
      'From my analysis of the content, the methodology employed was...',
      'The conclusions drawn from this research indicate that...',
      'This document presents a comprehensive overview of...',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
