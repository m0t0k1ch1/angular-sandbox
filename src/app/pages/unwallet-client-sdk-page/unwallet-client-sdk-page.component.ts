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
  UnWallet,
} from 'unwallet-client-sdk';
import { z } from 'zod';

import {
  SendTransactionFormInput,
  SignFormInput,
} from '../../interfaces/pages/unwallet-client-sdk-page';

import { NotificationService } from '../../services/notification.service';

import { SendTransactionFormComponent } from './send-transaction-form/send-transaction-form.component';
import { SignFormComponent } from './sign-form/sign-form.component';

import { environment } from '../../../environments/environment';

const idTokenPayloadSchema = z.object({
  sub: z.string().refine((val) => ethers.isAddress(val)),
  aud: z
    .array(z.string())
    .refine((val) => val.includes(environment.unWalletClientSDK.clientID)),
  iss: z.literal('https://id.unwallet.world'),
  exp: z.number(),
  iat: z.number(),
});

@Component({
  selector: 'app-unwallet-client-sdk-page',
  imports: [ButtonModule, SendTransactionFormComponent, SignFormComponent],
  templateUrl: './unwallet-client-sdk-page.component.html',
  styleUrl: './unwallet-client-sdk-page.component.css',
})
export class UnWalletClientSDKPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private notificationService = inject(NotificationService);

  public sdk = maybeInitialized<UnWallet>();
  public idTokenPayload =
    maybeInitialized<z.infer<typeof idTokenPayloadSchema>>();

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
        clientID: environment.unWalletClientSDK.clientID,
      }),
    );
  }

  private async initIDTokenPayload(idToken: string): Promise<void> {
    {
      const result = z.string().jwt().safeParse(idToken);
      if (!result.success) {
        for (const issue of result.error.issues) {
          this.notificationService.badRequest(issue.message);
        }
        return;
      }
    }

    let idTokenPayload: z.infer<typeof idTokenPayloadSchema>;
    {
      const result = idTokenPayloadSchema.safeParse(jwtDecode(idToken));
      if (!result.success) {
        for (const issue of result.error.issues) {
          this.notificationService.badRequest(issue.message);
        }
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
        // TODO: handle canceled error
        this.notificationService.unexpectedError(e);
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
        // TODO: handle canceled error
        this.notificationService.unexpectedError(e);
        return;
      }
    }

    this.notificationService.success(JSON.stringify(result));
  }

  public onClickDisconnectButton(): void {
    this.router.navigate([]);
  }
}
