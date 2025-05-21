import { ethers } from 'ethers';
import { z } from 'zod/v4';

export const ethAddressSchema = z
  .string()
  .refine((val) => ethers.isAddress(val), {
    message: 'Invalid eth address',
  });

export const hexStringSchema = z
  .string()
  .refine((val) => ethers.isHexString(val), {
    message: 'Invalid hex string',
  });

export const eip712TypedDataSchema = z.object({
  types: z.record(
    z.string().nonempty(),
    z.array(
      z.object({ name: z.string().nonempty(), type: z.string().nonempty() }),
    ),
  ),
  primaryType: z.string().nonempty(),
  domain: z.object({
    name: z.string().nonempty().optional(),
    version: z.string().nonempty().optional(),
    chainId: z.int().positive().optional(),
    verifyingContract: ethAddressSchema.optional(),
    salt: hexStringSchema.optional(),
  }),
  message: z.record(z.string().nonempty(), z.any()),
});
