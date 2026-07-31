import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { RippleDirective } from '@m0t0k1ch1/ngx';
import { UnWalletProvider } from 'unwallet-provider';
import { Address, Hex, fromHex, toHex } from 'viem';

import { NotificationService } from '@app/services';

import {
  FormOutput as SendTransactionFormOutput,
  SendTransactionForm,
} from './send-transaction-form/send-transaction-form';
import { FormOutput as SignFormOutput, SignForm } from './sign-form/sign-form';
import {
  FormOutput as SignEIP712TypedDataFormOutput,
  SignEIP712TypedDataForm,
} from './sign-eip712-typed-data-form/sign-eip712-typed-data-form';
import {
  FormOutput as SwitchChainFormOutput,
  SwitchChainForm,
} from './switch-chain-form/switch-chain-form';

import { env } from '@env';

@Component({
  selector: 'app-unwallet-provider-page',
  imports: [
    RippleDirective,
    SendTransactionForm,
    SignForm,
    SignEIP712TypedDataForm,
    SwitchChainForm,
  ],
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
    this.provider.on('chainChanged', (chainIDHex: Hex) => {
      this.chainIDSignal.set(fromHex(chainIDHex, 'bigint'));
    });

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

  public async onEthSignTypedDataFormSubmitted(
    formOutput: SignEIP712TypedDataFormOutput,
  ): Promise<void> {
    const addresses = this.addressesSignal();
    if (addresses === undefined || addresses.length === 0) {
      return;
    }

    let result: string;
    {
      try {
        result = await this.provider.request<string>({
          method: 'eth_signTypedData',
          params: [addresses[0], formOutput.typedData],
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.notificationService.success(result);
  }

  public async onEthSignTypedDataV4FormSubmitted(
    formOutput: SignEIP712TypedDataFormOutput,
  ): Promise<void> {
    const addresses = this.addressesSignal();
    if (addresses === undefined || addresses.length === 0) {
      return;
    }

    let result: string;
    {
      try {
        result = await this.provider.request<string>({
          method: 'eth_signTypedData_v4',
          params: [addresses[0], JSON.stringify(formOutput.typedData)],
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.notificationService.success(result);
  }

  public async onEthSendTransactionFormSubmitted(
    formOutput: SendTransactionFormOutput,
  ): Promise<void> {
    const addresses = this.addressesSignal();
    if (addresses === undefined || addresses.length === 0) {
      return;
    }

    const tx: {
      from: string;
      to: string;
      gas?: string;
      gasPrice?: string;
      value?: string;
      data?: string;
    } = {
      from: addresses[0],
      to: formOutput.toAddress,
    };
    {
      if (formOutput.gas !== undefined) {
        tx.gas = formOutput.gas;
      }
      if (formOutput.gasPrice !== undefined) {
        tx.gasPrice = formOutput.gasPrice;
      }
      if (formOutput.value !== undefined) {
        tx.value = formOutput.value;
      }
      if (formOutput.data !== undefined) {
        tx.data = formOutput.data;
      }
    }

    let result: string;
    {
      try {
        result = await this.provider.request<string>({
          method: 'eth_sendTransaction',
          params: [tx],
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }

    this.notificationService.success(result);
  }

  public async onWalletSwitchEthereumChainFormSubmitted(
    formOutput: SwitchChainFormOutput,
  ): Promise<void> {
    {
      try {
        await this.provider.request<null>({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: formOutput.chainID,
            },
          ],
        });
      } catch (e) {
        this.handleProviderError(e);
        return;
      }
    }
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
