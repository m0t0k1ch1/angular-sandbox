import { z } from 'zod';

import { ethAddressSchema } from './eth-address';
import { hexSchema } from './hex';

export const eip712TypedDataSchema = z.object({
  types: z.record(
    z.string().nonempty(),
    z.array(z.object({ name: z.string().nonempty(), type: z.string().nonempty() })),
  ),
  primaryType: z.string().nonempty(),
  domain: z.object({
    name: z.string().nonempty().optional(),
    version: z.string().nonempty().optional(),
    chainId: z.int().positive().optional(),
    verifyingContract: ethAddressSchema.optional(),
    salt: hexSchema.optional(),
  }),
  message: z.record(z.string().nonempty(), z.any()),
});
