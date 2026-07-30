import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'unwallet-client-sdk',
    loadComponent: () => import('@app/pages/unwallet-client-sdk/unwallet-client-sdk'),
  },
  {
    path: '**',
    loadComponent: () => import('@app/pages/not-found/not-found'),
  },
];
