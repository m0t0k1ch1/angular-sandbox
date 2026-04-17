import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';

import { env } from '@env';

import { ethAddressSchema } from './eth-address';

export const unWalletIDTokenPayloadSchema = z.object({
  sub: ethAddressSchema,
  aud: z
    .array(z.string())
    .nonempty()
    .refine((val) => val.includes(env.unWalletClientSDK.clientID), {
      error: `Must include ${env.unWalletClientSDK.clientID}`,
    }),
  iss: z.literal(env.unWalletClientSDK.idTokenIssuer),
  exp: z.int().positive(),
  iat: z.int().positive(),
});

export const unWalletIDTokenSchema = z
  .jwt({
    abort: true,
  })
  .transform((val) => jwtDecode(val))
  .pipe(unWalletIDTokenPayloadSchema);

export type UnWalletIDTokenPayload = z.infer<typeof unWalletIDTokenPayloadSchema>;
