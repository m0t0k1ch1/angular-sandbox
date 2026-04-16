import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { initialized, maybeInitialized, uninitialized } from '@m0t0k1ch1/with-state';
import { jwtDecode } from 'jwt-decode';
import { SendTransactionResult, SignResult, UWError, UnWallet } from 'unwallet-client-sdk';
import { z } from 'zod';

import { NotificationService } from '@app/services/notification';
import { ethAddressSchema } from '@app/types';
import {
  SendTransactionFormInput,
  SignFormInput,
  SignEIP712TypedDataFormInput,
} from '@app/types/pages/unwallet-client-sdk';

import { SendTransactionFormComponent } from './send-transaction-form/send-transaction-form.component';
import { SignFormComponent } from './sign-form/sign-form.component';
import { SignEIP712TypedDataFormComponent } from './sign-eip712-typed-data-form/sign-eip712-typed-data-form.component';

import { env } from '@env';

const idTokenSchema = z
  .jwt({
    abort: true,
  })
  .transform((val) => jwtDecode(val))
  .pipe(
    z.object({
      sub: ethAddressSchema,
      aud: z
        .array(z.string())
        .nonempty()
        .refine((val) => val.includes(env.unWalletClientSDK.clientID), {
          message: `Must include ${env.unWalletClientSDK.clientID}`,
        }),
      iss: z.literal(env.unWalletClientSDK.idTokenIssuer),
      exp: z.int().positive(),
      iat: z.int().positive(),
    }),
  );

@Component({
  selector: 'app-unwallet-client-sdk-page',
  imports: [
    ButtonModule,
    SendTransactionFormComponent,
    SignFormComponent,
    SignEIP712TypedDataFormComponent,
  ],
  templateUrl: './unwallet-client-sdk.html',
  styleUrl: './unwallet-client-sdk.css',
})
export class UnWalletClientSDKPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private notificationService = inject(NotificationService);

  public sdk = maybeInitialized<UnWallet>();
  public idTokenPayload = maybeInitialized<z.infer<typeof idTokenSchema>>();

  public ngOnInit(): void {
    this.route.fragment.subscribe((flagment) => {
      let idToken: string | null = null;
      {
        if (flagment !== null && flagment.startsWith('id_token=')) {
          idToken = flagment.replace('id_token=', '');
        }
      }

      this.init(idToken);
    });
  }

  private async init(idToken: string | null): Promise<void> {
    this.sdk = uninitialized();
    this.idTokenPayload = uninitialized();

    this.initSDK();

    if (idToken !== null) {
      this.initIDTokenPayload(idToken);
    }
  }

  private async initSDK(): Promise<void> {
    this.sdk = initialized(
      await UnWallet.init({
        env: env.unWalletClientSDK.env,
        clientID: env.unWalletClientSDK.clientID,
      }),
    );
  }

  private async initIDTokenPayload(idToken: string): Promise<void> {
    let idTokenPayload: z.infer<typeof idTokenSchema>;
    {
      const result = idTokenSchema.safeParse(idToken);
      if (!result.success) {
        this.notificationService.error(`invalid id token: ${result.error.message}`);
        return;
      }

      idTokenPayload = result.data;
    }

    this.idTokenPayload = initialized(idTokenPayload);
  }

  public onClickAuthorizeButton(): void {
    if (!this.sdk.isInitialized) {
      return;
    }

    this.sdk.data.authorize({
      redirectURL: env.unWalletClientSDK.redirectURL,
    });
  }

  public async onSubmitSign(input: SignFormInput): Promise<void> {
    if (!this.sdk.isInitialized) {
      return;
    }

    let result: SignResult;
    {
      try {
        result = await this.sdk.data.sign(input);
      } catch (e) {
        this.handleSDKError(e);
        return;
      }
    }

    this.notificationService.success(JSON.stringify(result));
  }

  public async onSubmitSignEIP712TypedData(input: SignEIP712TypedDataFormInput): Promise<void> {
    if (!this.sdk.isInitialized) {
      return;
    }

    let result: SignResult;
    {
      try {
        result = await this.sdk.data.signEIP712TypedData(input);
      } catch (e) {
        this.handleSDKError(e);
        return;
      }
    }

    this.notificationService.success(JSON.stringify(result));
  }

  public async onSubmitSendTransaction(input: SendTransactionFormInput): Promise<void> {
    if (!this.sdk.isInitialized) {
      return;
    }

    let result: SendTransactionResult;
    {
      try {
        result = await this.sdk.data.sendTransaction(input);
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

  private handleSDKError(err: unknown): void {
    if (err instanceof UWError && ["INVALID_REQUEST", "REQUEST_REJECTED"].includes(err.code)) {
      this.notificationService.error(err.message);
      return;
    }

    this.notificationService.unexpectedError(err);
  }
}
