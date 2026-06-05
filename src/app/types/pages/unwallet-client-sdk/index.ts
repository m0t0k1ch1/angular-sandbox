import { EIP712TypedData } from 'unwallet-client-sdk';
import { z } from 'zod';

import { eip712TypedDataSchema } from '../../eip712';

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

export const signEIP712TypedDataFormSchema = z.object({
  typedData: z
    .string()
    .refine(
      (val) => {
        try {
          JSON.parse(val);
        } catch (e) {
          return false;
        }
        return true;
      },
      {
        error: 'must be a valid json',
        abort: true,
      },
    )
    .refine(
      (val) => {
        return eip712TypedDataSchema.safeParse(JSON.parse(val)).success;
      },
      {
        error: 'must be a valid eip712 typed data',
      },
    ),
  ticketToken: z.jwt({
    error: 'must be a valid jwt',
  }),
});

export type SignEIP712TypedDataFormInput = z.infer<typeof signEIP712TypedDataFormSchema>;
export type SignEIP712TypedDataFormOutput = {
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
