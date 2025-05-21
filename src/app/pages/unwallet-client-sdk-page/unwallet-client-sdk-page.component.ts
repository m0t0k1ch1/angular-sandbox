import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import {
  initialized,
  maybeInitialized,
  uninitialized,
} from '@m0t0k1ch1/with-state';
import { ethers } from 'ethers';
import { jwtDecode } from 'jwt-decode';
import {
  SendTransactionResult,
  SignResult,
  UWError,
  UnWallet,
} from 'unwallet-client-sdk';
import { z } from 'zod/v4';

import { ethAddressSchema } from '../../schemas';

import {
  SendTransactionFormInput,
  SignFormInput,
  SignEIP712TypedDataFormInput,
} from '../../interfaces/pages/unwallet-client-sdk-page';

import { NotificationService } from '../../services/notification.service';

import { SendTransactionFormComponent } from './send-transaction-form/send-transaction-form.component';
import { SignFormComponent } from './sign-form/sign-form.component';
import { SignEIP712TypedDataFormComponent } from './sign-eip712-typed-data-form/sign-eip712-typed-data-form.component';

import { environment } from '../../../environments/environment';

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
        .refine((val) => val.includes(environment.unWalletClientSDK.clientID), {
          message: `Must include ${environment.unWalletClientSDK.clientID}`,
        }),
      iss: z.literal(environment.unWalletClientSDK.idTokenIssuer),
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
  templateUrl: './unwallet-client-sdk-page.component.html',
  styleUrl: './unwallet-client-sdk-page.component.css',
})
export class UnWalletClientSDKPageComponent implements OnInit {
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
        env: environment.unWalletClientSDK.env,
        clientID: environment.unWalletClientSDK.clientID,
      }),
    );
  }

  private async initIDTokenPayload(idToken: string): Promise<void> {
    let idTokenPayload: z.infer<typeof idTokenSchema>;
    {
      const result = idTokenSchema.safeParse(idToken);
      if (!result.success) {
        this.notificationService.badRequest(
          `invalid id token: ${result.error.message}`,
        );
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
      redirectURL: environment.unWalletClientSDK.redirectURL,
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

  public async onSubmitSignEIP712TypedData(
    input: SignEIP712TypedDataFormInput,
  ): Promise<void> {
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

  public async onSubmitSendTransaction(
    input: SendTransactionFormInput,
  ): Promise<void> {
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
    if (err instanceof UWError) {
      switch (err.code) {
        case 'INVALID_REQUEST':
          this.notificationService.badRequest(err.message);
          return;
        case 'REQUEST_REJECTED':
          this.notificationService.failure(err.message);
          return;
      }
    }

    this.notificationService.unexpectedError(err);
  }
}
