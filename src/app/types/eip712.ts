import { isAddress, isHex } from 'viem';
import { z } from 'zod';

export const eip712TypedDataSchema = z.object({
  types: z.record(
    z.string().nonempty(),
    z.array(
      z.object({
        name: z.string().nonempty(),
        type: z.string().nonempty(),
      }),
    ),
  ),
  primaryType: z.string().nonempty(),
  domain: z.object({
    name: z.string().nonempty().optional(),
    version: z.string().nonempty().optional(),
    chainId: z.int().positive().optional(),
    verifyingContract: z
      .string()
      .refine((val) => isAddress(val), {
        error: 'Must be an Ethereum address',
      })
      .optional(),
    salt: z
      .string()
      .refine((val) => isHex(val), {
        error: 'Must be a hex string',
      })
      .optional(),
  }),
  message: z.record(z.string().nonempty(), z.any()),
});

export type EIP712TypedData = z.infer<typeof eip712TypedDataSchema>;
