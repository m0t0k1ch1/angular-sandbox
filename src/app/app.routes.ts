import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'unwallet-client-sdk',
    loadComponent: () => import('@app/pages/unwallet-client-sdk/unwallet-client-sdk'),
  },
  {
    path: 'unwallet-provider',
    loadComponent: () => import('@app/pages/unwallet-provider/unwallet-provider'),
  },
  {
    path: '**',
    loadComponent: () => import('@app/pages/not-found/not-found'),
  },
];
