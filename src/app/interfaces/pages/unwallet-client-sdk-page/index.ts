import { EIP712TypedData } from 'unwallet-client-sdk';

export interface SignFormInput {
  message: string;
  ticketToken: string;
}

export interface SignEIP712TypedDataFormInput {
  typedData: EIP712TypedData;
  ticketToken: string;
}

export interface SendTransactionFormInput {
  chainID: number;
  toAddress: string;
  value?: string;
  data?: string;
  ticketToken: string;
}
