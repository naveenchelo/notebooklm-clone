import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as DocumentActions from '../../store/actions/document.actions';
import * as DocumentSelectors from '../../store/selectors/document.selectors';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  documents$: Observable<Document[]>;
  loading$: Observable<boolean>;
  documentsStats$: Observable<any>;

  constructor(private store: Store) {
    this.documents$ = this.store.select(
      DocumentSelectors.selectRecentDocuments(5),
    );
    this.loading$ = this.store.select(DocumentSelectors.selectDocumentsLoading);
    this.documentsStats$ = this.store.select(
      DocumentSelectors.selectDocumentsStats,
    );
  }

  ngOnInit() {
    // Load documents when component initializes
    this.store.dispatch(DocumentActions.loadDocuments());
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
