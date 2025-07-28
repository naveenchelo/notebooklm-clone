import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
})
export class Upload {
  isDragOver = false;
  uploadingFiles: Array<{ name: string; progress: number }> = [];
  recentUploads: Array<{ name: string; uploadedAt: Date }> = [
    { name: 'Research Paper.pdf', uploadedAt: new Date() },
    { name: 'Meeting Notes.pdf', uploadedAt: new Date(Date.now() - 86400000) },
  ];

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

    pdfFiles.forEach((file) => {
      this.uploadingFiles.push({ name: file.name, progress: 0 });
      this.simulateUpload(file);
    });
  }

  private simulateUpload(file: File) {
    const uploadItem = this.uploadingFiles.find(
      (item) => item.name === file.name,
    );
    if (!uploadItem) return;

    const interval = setInterval(() => {
      uploadItem.progress += Math.random() * 20;
      if (uploadItem.progress >= 100) {
        uploadItem.progress = 100;
        clearInterval(interval);

        // Add to recent uploads
        setTimeout(() => {
          this.recentUploads.unshift({
            name: file.name,
            uploadedAt: new Date(),
          });
          this.uploadingFiles = this.uploadingFiles.filter(
            (item) => item.name !== file.name,
          );
        }, 500);
      }
    }, 200);
  }
}
