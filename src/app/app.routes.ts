import { Routes } from '@angular/router';

import { UnWalletClientSDKPageComponent } from './pages/unwallet-client-sdk-page/unwallet-client-sdk-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';

export const routes: Routes = [
  {
    path: 'unwallet-client-sdk',
    component: UnWalletClientSDKPageComponent,
  },
  {
    path: '**',
    component: NotFoundPageComponent,
  },
];
