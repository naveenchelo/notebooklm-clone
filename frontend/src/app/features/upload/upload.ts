import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Document } from '../../models/document.model';
import * as DocumentActions from '../../store/actions/document.actions';
import * as DocumentSelectors from '../../store/selectors/document.selectors';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
})
export class Upload implements OnInit {
  isDragOver = false;
  uploadingFiles: Array<{ name: string; progress: number; error?: string }> =
    [];

  // NgRx observables
  documents$: Observable<Document[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  uploadProgress$: Observable<{ [key: string]: number }>;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
  ) {
    this.documents$ = this.store.select(DocumentSelectors.selectAllDocuments);
    this.loading$ = this.store.select(DocumentSelectors.selectDocumentsLoading);
    this.error$ = this.store.select(DocumentSelectors.selectDocumentsError);
    this.uploadProgress$ = this.store.select(
      DocumentSelectors.selectUploadProgress,
    );
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  ngOnInit() {
    // Load existing documents
    this.store.dispatch(DocumentActions.loadDocuments());
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private handleFiles(files: File[]) {
    const pdfFiles = files.filter((file) => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      this.snackBar.open('Please select PDF files only', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (pdfFiles.length === 1) {
      this.uploadSingleFile(pdfFiles[0]);
    } else {
      this.uploadMultipleFiles(pdfFiles);
    }
  }

  private uploadSingleFile(file: File) {
    this.uploadingFiles.push({ name: file.name, progress: 0 });
    this.store.dispatch(DocumentActions.uploadDocument({ file }));
  }

  private uploadMultipleFiles(files: File[]) {
    files.forEach((file) => {
      this.uploadingFiles.push({ name: file.name, progress: 0 });
    });
    this.store.dispatch(DocumentActions.uploadMultipleDocuments({ files }));
  }

  retryUpload(fileName: string) {
    // Remove from uploading files and retry
    this.uploadingFiles = this.uploadingFiles.filter(
      (file) => file.name !== fileName,
    );
    // Note: In a real implementation, you'd need to store the original file reference
    this.snackBar.open(`Retrying upload for ${fileName}`, 'Close', {
      duration: 2000,
    });
  }

  removeUpload(fileName: string) {
    this.uploadingFiles = this.uploadingFiles.filter(
      (file) => file.name !== fileName,
    );
    this.snackBar.open(`Removed ${fileName} from upload queue`, 'Close', {
      duration: 2000,
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
