import { isAddress } from 'viem';
import { z } from 'zod';

export const ethAddressSchema = z
  .string()
  .nonempty()
  .refine((val) => isAddress(val), {
    error: 'Invalid eth address',
    abort: true,
  });
