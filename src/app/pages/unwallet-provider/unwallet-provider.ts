import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { RippleDirective } from '@m0t0k1ch1/ngx';
import { UnWalletProvider } from 'unwallet-provider';

import { NotificationService } from '@app/services';

import { env } from '@env';

@Component({
  selector: 'app-unwallet-provider-page',
  imports: [RippleDirective],
  templateUrl: './unwallet-provider.html',
  styleUrl: './unwallet-provider.css',
})
export default class UnwalletProviderPage implements OnInit {
  private readonly notificationService = inject(NotificationService);

  private readonly provider = new UnWalletProvider(env.unWalletProvider);

  public readonly addressesSignal = signal<string[] | undefined>(undefined);
  public readonly chainIDSignal = signal<number | undefined>(undefined);

  public readonly isConnectedSignal = computed(() => {
    const addresses = this.addressesSignal();
    const chainID = this.chainIDSignal();

    return addresses !== undefined && addresses.length > 0 && chainID !== undefined;
  });

  ngOnInit(): void {
    this.init();
  }

  private async init(): Promise<void> {
    // TODO: try to init addresses and chain id
  }

  public async onConnectButtonClicked(): Promise<void> {
    try {
      await this.provider.enable();
    } catch (e) {
      this.handleProviderError(e);
      return;
    }

    let addresses: string[];
    {
      try {
        addresses = await this.provider.request<string[]>({
          method: 'eth_accounts',
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    let chainID: number;
    {
      try {
        chainID = await this.provider.request<number>({
          method: 'eth_chainId',
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.addressesSignal.set(addresses);
    this.chainIDSignal.set(chainID);
  }

  public async onDisconnectButtonClicked(): Promise<void> {
    try {
      await this.provider.disable();
    } catch (e) {
      this.handleProviderError(e);
      return;
    }

    this.addressesSignal.set(undefined);
    this.chainIDSignal.set(undefined);
  }

  private handleProviderError(x: unknown): void {
    this.notificationService.unexpectedError(x);
  }
}
