import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./features/upload/upload').then((m) => m.Upload),
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat').then((m) => m.Chat),
      },
      {
        path: 'viewer',
        loadComponent: () =>
          import('./features/viewer/viewer').then((m) => m.Viewer),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
