export interface SignFormInput {
  message: string;
  ticketToken: string;
}

export interface SendTransactionFormInput {
  chainID: number;
  toAddress: string;
  value?: string;
  data?: string;
  ticketToken: string;
}
