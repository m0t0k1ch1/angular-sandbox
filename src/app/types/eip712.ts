import { isAddress, isHex } from 'viem';
import { z } from 'zod';

// from https://eips.ethereum.org/assets/eip-712/Example.js
export const sampleEIP712TypedData: EIP712TypedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
};

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
