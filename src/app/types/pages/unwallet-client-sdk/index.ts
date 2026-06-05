import { EIP712TypedData } from 'unwallet-client-sdk';
import { z } from 'zod';

import { eip712TypedDataSchema } from '../../eip712';
import { ethAddressSchema } from '../../eth-address';
import { hexSchema } from '../../hex';

export const signFormSchema = z.object({
  message: z.string().nonempty({
    error: 'required',
  }),
  ticketToken: z.jwt({
    error: 'must be a jwt',
  }),
});

export type SignFormInput = z.infer<typeof signFormSchema>;
export type SignFormOutput = {
  message: string;
  ticketToken: string;
};

export const signEIP712TypedDataFormSchema = z.object({
  typedData: z.string().refine(
    (val) => {
      let parsed: unknown;
      {
        try {
          parsed = JSON.parse(val);
        } catch (e) {
          return false;
        }
      }

      return eip712TypedDataSchema.safeParse(parsed).success;
    },
    {
      error: 'must be an eip712 typed data',
    },
  ),
  ticketToken: z.jwt({
    error: 'must be a jwt',
  }),
});

export type SignEIP712TypedDataFormInput = z.infer<typeof signEIP712TypedDataFormSchema>;
export type SignEIP712TypedDataFormOutput = {
  typedData: EIP712TypedData;
  ticketToken: string;
};

export const sendTransactionFormSchema = z.object({
  chainID: z.string().refine((val) => z.coerce.number().int().positive().safeParse(val).success, {
    error: 'must be a positive integer',
  }),
  toAddress: z.string().refine((val) => ethAddressSchema.safeParse(val).success, {
    error: 'must be an ethereum address',
  }),
  value: z
    .string()
    .refine(
      (val) => z.union([z.coerce.number().positive(), z.string().length(0)]).safeParse(val).success,
      {
        error: 'must be a positive number or empty',
      },
    ),
  data: z
    .string()
    .refine((val) => z.union([hexSchema, z.string().length(0)]).safeParse(val).success, {
      error: 'must be a hex or empty',
    }),
  ticketToken: z.jwt({
    error: 'must be a jwt',
  }),
});

export type SendTransactionFormInput = z.infer<typeof sendTransactionFormSchema>;
export type SendTransactionFormOutput = {
  chainID: number;
  toAddress: string;
  value?: string;
  data?: string;
  ticketToken: string;
};
