import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  @ViewChild('drawer') drawer!: MatSidenav;

  isSidebarOpen = true;
  isHandset = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isHandset = result.matches;
        if (this.isHandset) {
          this.isSidebarOpen = false;
        }
      });
  }

  toggleSidebar() {
    if (this.isHandset) {
      this.drawer.toggle();
    } else {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  closeSidebarOnMobile() {
    if (this.isHandset) {
      this.drawer.close();
    }
  }
}
