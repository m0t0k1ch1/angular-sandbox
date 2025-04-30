import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { initialized, maybeInitialized } from '@m0t0k1ch1/with-state';
import { ethers, id } from 'ethers';
import { jwtDecode } from 'jwt-decode';
import { ButtonModule } from 'primeng/button';
import { UnWallet } from 'unwallet-client-sdk';
import { z } from 'zod';

import { NotificationService } from '../../services/notification.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-unwallet-client-sdk-page',
  imports: [ButtonModule],
  templateUrl: './unwallet-client-sdk-page.component.html',
  styleUrl: './unwallet-client-sdk-page.component.css',
})
export class UnWalletClientSDKPageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  private notificationService = inject(NotificationService);

  private idTokenPayloadSchema = z.object({
    sub: z.string().refine((val) => ethers.isAddress(val)),
    aud: z
      .array(z.string())
      .refine((val) => val.includes(environment.unWalletClientSDK.clientID)),
    iss: z.literal('https://id.unwallet.world'),
    exp: z.number(),
    iat: z.number(),
  });

  public sdk = maybeInitialized<UnWallet>();
  public idTokenPayload =
    maybeInitialized<z.infer<typeof this.idTokenPayloadSchema>>();

  public ngOnInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    this.initSDK();

    const flagment = this.route.snapshot.fragment;
    if (flagment !== null && flagment.startsWith('id_token=')) {
      this.initIDTokenPayload(flagment.replace('id_token=', ''));
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

    let idTokenPayload: z.infer<typeof this.idTokenPayloadSchema>;
    {
      const result = this.idTokenPayloadSchema.safeParse(jwtDecode(idToken));
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

  public onClickSignButton(): void {
    if (!this.sdk.isInitialized || !this.idTokenPayload.isInitialized) {
      return;
    }

    // TODO
  }

  public onClickSendTransactionButton(): void {
    if (!this.sdk.isInitialized || !this.idTokenPayload.isInitialized) {
      return;
    }

    // TODO
  }
}
