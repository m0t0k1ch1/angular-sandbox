import { makeEnvironmentProviders } from '@angular/core';

import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

export const primengProvider = makeEnvironmentProviders([
  providePrimeNG({
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        cssLayer: {
          name: 'primeng',
          order: 'theme, base, primeng',
        },
        darkModeSelector: false,
      },
    },
  }),
  MessageService,
]);
