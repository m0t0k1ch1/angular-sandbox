import { isHex } from 'viem';
import { z } from 'zod';

export const hexSchema = z
  .string()
  .nonempty()
  .refine((val) => isHex(val), {
    error: 'Invalid hex',
    abort: true,
  });
