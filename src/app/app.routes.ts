import { Routes } from '@angular/router';

import { NotFoundPage, UnWalletClientSDKPage } from '@app/pages';

export const routes: Routes = [
  {
    path: 'unwallet-client-sdk',
    component: UnWalletClientSDKPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
