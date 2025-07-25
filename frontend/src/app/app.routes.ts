import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout').then((m) => m.MainLayout),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
