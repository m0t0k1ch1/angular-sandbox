import { EIP712TypedData } from 'unwallet-client-sdk';

export type SignFormInput = {
  message: string;
  ticketToken: string;
};

export type SignEIP712TypedDataFormInput = {
  typedData: EIP712TypedData;
  ticketToken: string;
};

export type SendTransactionFormInput = {
  chainID: number;
  toAddress: string;
  value?: string;
  data?: string;
  ticketToken: string;
};
