import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss',
})
export class Viewer implements OnInit {
  @ViewChild('pdfContainer') pdfContainer!: ElementRef;

  currentPage = 1;
  totalPages = 10;
  zoom = 1;
  showSidebar = false;

  annotations = [
    {
      id: 1,
      type: 'Highlight',
      page: 1,
      text: 'Important information about the methodology',
    },
    {
      id: 2,
      type: 'Note',
      page: 3,
      text: 'This section needs further review',
    },
  ];

  ngOnInit() {
    // Initialize PDF viewer
    this.loadMockPDF();
  }

  loadMockPDF() {
    // In a real implementation, this would load the actual PDF using PDF.js
    console.log('Loading PDF...');
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  zoomIn() {
    if (this.zoom < 3) {
      this.zoom = Math.min(3, this.zoom + 0.25);
    }
  }

  zoomOut() {
    if (this.zoom > 0.25) {
      this.zoom = Math.max(0.25, this.zoom - 0.25);
    }
  }

  setZoom(value: number) {
    this.zoom = value;
  }

  fitToWidth() {
    // Calculate zoom to fit width
    const container = this.pdfContainer.nativeElement;
    const pageWidth = 612; // Standard A4 width
    const containerWidth = container.clientWidth - 64; // Account for padding
    this.zoom = containerWidth / pageWidth;
  }

  fitToPage() {
    // Calculate zoom to fit page
    const container = this.pdfContainer.nativeElement;
    const pageWidth = 612;
    const pageHeight = 792;
    const containerWidth = container.clientWidth - 64;
    const containerHeight = container.clientHeight - 64;

    const scaleX = containerWidth / pageWidth;
    const scaleY = containerHeight / pageHeight;
    this.zoom = Math.min(scaleX, scaleY, 1);
  }

  downloadPDF() {
    // In a real implementation, this would trigger PDF download
    console.log('Downloading PDF...');
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  addAnnotation() {
    // In a real implementation, this would open annotation dialog
    console.log('Adding annotation...');
  }
}
