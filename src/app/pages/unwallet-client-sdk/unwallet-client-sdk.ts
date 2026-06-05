import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { SendTransactionResult, SignResult, UnWallet, UWError } from 'unwallet-client-sdk';

import { NotificationService } from '@app/services/notification';
import { unWalletIDTokenSchema, UnWalletIDTokenPayload } from '@app/types/unwallet';
import {
  SendTransactionFormOutput,
  SignFormOutput,
  SignEIP712TypedDataFormOutput,
} from '@app/types/pages/unwallet-client-sdk';

import { env } from '@env';

import { SendTransactionForm } from './send-transaction-form/send-transaction-form';
import { SignForm } from './sign-form/sign-form';
import { SignEIP712TypedDataForm } from './sign-eip712-typed-data-form/sign-eip712-typed-data-form';

@Component({
  selector: 'app-unwallet-client-sdk-page',
  imports: [ButtonModule, SendTransactionForm, SignForm, SignEIP712TypedDataForm],
  templateUrl: './unwallet-client-sdk.html',
  styleUrl: './unwallet-client-sdk.css',
})
export class UnWalletClientSDKPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly notificationService = inject(NotificationService);

  private readonly sdkSignal = signal<UnWallet | undefined>(undefined);
  private readonly idTokenPayloadSignal = signal<UnWalletIDTokenPayload | undefined>(undefined);

  public readonly isSDKInitializedSignal = computed(() => {
    return this.sdkSignal() !== undefined;
  });
  public readonly isIDTokenPayloadInitializedSignal = computed(() => {
    return this.idTokenPayloadSignal() !== undefined;
  });

  ngOnInit(): void {
    this.initSDK();

    this.route.fragment.subscribe((flagment) => {
      this.idTokenPayloadSignal.set(undefined);

      let idToken: string | null = null;
      {
        if (flagment !== null && flagment.startsWith('id_token=')) {
          idToken = flagment.replace('id_token=', '');
        }
      }

      if (idToken !== null) {
        this.initIDTokenPayload(idToken);
      }
    });
  }

  private async initSDK(): Promise<void> {
    this.sdkSignal.set(
      await UnWallet.init({
        env: env.unWalletClientSDK.env,
        clientID: env.unWalletClientSDK.clientID,
      }),
    );
  }

  private initIDTokenPayload(idToken: string): void {
    let idTokenPayload: UnWalletIDTokenPayload;
    {
      const result = unWalletIDTokenSchema.safeParse(idToken);
      if (!result.success) {
        this.notificationService.error(`invalid id token: ${result.error.message}`);
        return;
      }

      idTokenPayload = result.data;
    }

    this.idTokenPayloadSignal.set(idTokenPayload);
  }

  public onClickAuthorizeButton(): void {
    const sdk = this.sdkSignal();
    if (sdk === undefined) {
      return;
    }

    sdk.authorize({
      redirectURL: env.unWalletClientSDK.redirectURL,
    });
  }

  public async onSubmitSign(formOutput: SignFormOutput): Promise<void> {
    const sdk = this.sdkSignal();
    if (sdk === undefined) {
      return;
    }

    let result: SignResult;
    {
      try {
        result = await sdk.sign(formOutput);
      } catch (e) {
        this.handleSDKError(e);
        return;
      }
    }

    this.notificationService.success(JSON.stringify(result));
  }

  public async onSubmitSignEIP712TypedData(
    formOutput: SignEIP712TypedDataFormOutput,
  ): Promise<void> {
    const sdk = this.sdkSignal();
    if (sdk === undefined) {
      return;
    }

    let result: SignResult;
    {
      try {
        result = await sdk.signEIP712TypedData(formOutput);
      } catch (e) {
        this.handleSDKError(e);
        return;
      }
    }

    this.notificationService.success(JSON.stringify(result));
  }

  public async onSubmitSendTransaction(formOutput: SendTransactionFormOutput): Promise<void> {
    const sdk = this.sdkSignal();
    if (sdk === undefined) {
      return;
    }

    let result: SendTransactionResult;
    {
      try {
        result = await sdk.sendTransaction(formOutput);
      } catch (e) {
        this.handleSDKError(e);
        return;
      }
    }

    this.notificationService.success(JSON.stringify(result));
  }

  public onClickDisconnectButton(): void {
    this.router.navigate([]);
  }

  private handleSDKError(x: unknown): void {
    if (x instanceof UWError && ['INVALID_REQUEST', 'REQUEST_REJECTED'].includes(x.code)) {
      this.notificationService.error(x.message);
      return;
    }

    this.notificationService.unexpectedError(x);
  }
}
