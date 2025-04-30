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
  public sdk = maybeInitialized<UnWallet>();
  public address = maybeInitialized<string>();

  public ngOnInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    this.sdk = initialized(
      await UnWallet.init({
        clientID: environment.unWalletClientSDK.clientID,
      }),
    );
  }

  public onClickAuthorizeButton(): void {
    if (!this.sdk.isInitialized) {
      return;
    }

    this.sdk.data.authorize({
      redirectURL: environment.unWalletClientSDK.redirectURL,
    });
  }

  public onClickSignButton(): void {
    if (!this.sdk.isInitialized || !this.address.isInitialized) {
      return;
    }

    // TODO
  }

  public onClickSendTransactionButton(): void {
    if (!this.sdk.isInitialized || !this.address.isInitialized) {
      return;
    }

    // TODO
  }
}
