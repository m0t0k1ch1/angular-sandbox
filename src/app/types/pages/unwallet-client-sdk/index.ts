import { EIP712TypedData } from 'unwallet-client-sdk';
import { z } from 'zod';

export const signFormSchema = z.object({
  message: z.string().nonempty({
    error: 'required',
  }),
  ticketToken: z.jwt({
    error: 'must be a valid jwt',
  }),
});

export type SignFormInput = z.infer<typeof signFormSchema>;
export type SignFormOutput = {
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
