import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface Document {
  id: string;
  name: string;
  uploadedAt: Date;
  size: string;
  pages: number;
  lastAccessed?: Date;
}

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
  recentDocuments: Document[] = [
    {
      id: '1',
      name: 'Research Paper on Machine Learning.pdf',
      uploadedAt: new Date(Date.now() - 86400000), // 1 day ago
      size: '2.4 MB',
      pages: 15,
      lastAccessed: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '2',
      name: 'Meeting Notes - Q4 Planning.pdf',
      uploadedAt: new Date(Date.now() - 172800000), // 2 days ago
      size: '1.8 MB',
      pages: 8,
      lastAccessed: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: '3',
      name: 'Technical Documentation.pdf',
      uploadedAt: new Date(Date.now() - 604800000), // 1 week ago
      size: '5.2 MB',
      pages: 32,
    },
  ];
}
