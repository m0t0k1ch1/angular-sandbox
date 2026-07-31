import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { RippleDirective } from '@m0t0k1ch1/ngx';
import { UnWalletProvider } from 'unwallet-provider';
import { Address, Hex, fromHex, toHex } from 'viem';

import { NotificationService } from '@app/services';

import { FormOutput as SignFormOutput, SignForm } from './sign-form/sign-form';

import { env } from '@env';

@Component({
  selector: 'app-unwallet-provider-page',
  imports: [RippleDirective, SignForm],
  templateUrl: './unwallet-provider.html',
  styleUrl: './unwallet-provider.css',
})
export default class UnwalletProviderPage implements OnInit {
  private readonly notificationService = inject(NotificationService);

  private readonly provider = new UnWalletProvider(env.unWalletProvider);

  public readonly addressesSignal = signal<Address[] | undefined>(undefined);
  public readonly chainIDSignal = signal<bigint | undefined>(undefined);

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

    let addresses: Address[];
    {
      try {
        addresses = await this.provider.request<Address[]>({
          method: 'eth_accounts',
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    let chainIDHex: Hex;
    {
      try {
        chainIDHex = await this.provider.request<Hex>({
          method: 'eth_chainId',
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.addressesSignal.set(addresses);
    this.chainIDSignal.set(fromHex(chainIDHex, 'bigint'));
  }

  public async onPersonalSignFormSubmitted(formOutput: SignFormOutput): Promise<void> {
    const addresses = this.addressesSignal();
    if (addresses === undefined || addresses.length === 0) {
      return;
    }

    let result: string;
    {
      try {
        result = await this.provider.request<string>({
          method: 'personal_sign',
          params: [toHex(formOutput.message), addresses[0]],
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.notificationService.success(result);
  }

  public async onEthSignFormSubmitted(formOutput: SignFormOutput): Promise<void> {
    const addresses = this.addressesSignal();
    if (addresses === undefined || addresses.length === 0) {
      return;
    }

    let result: string;
    {
      try {
        result = await this.provider.request<string>({
          method: 'eth_sign',
          params: [addresses[0], toHex(formOutput.message)],
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.notificationService.success(result);
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
