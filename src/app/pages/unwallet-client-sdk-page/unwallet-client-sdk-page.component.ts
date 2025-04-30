import { Component, OnInit } from '@angular/core';

import { initialized, maybeInitialized } from '@m0t0k1ch1/with-state';
import { ButtonModule } from 'primeng/button';
import { UnWallet } from 'unwallet-client-sdk';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-unwallet-client-sdk-page',
  imports: [ButtonModule],
  templateUrl: './unwallet-client-sdk-page.component.html',
  styleUrl: './unwallet-client-sdk-page.component.css',
})
export class UnWalletClientSDKPageComponent implements OnInit {
  public unWallet = maybeInitialized<UnWallet>();

  public ngOnInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    this.unWallet = initialized(
      await UnWallet.init({
        clientID: environment.unWalletClientSDK.clientID,
      }),
    );
  }

  public onClickAuthorizeButton(): void {
    if (!this.unWallet.isInitialized) {
      return;
    }

    this.unWallet.data.authorize({
      redirectURL: environment.unWalletClientSDK.redirectURL,
    });
  }
}
