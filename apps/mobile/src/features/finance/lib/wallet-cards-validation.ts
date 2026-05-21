import { z } from "zod";

import { walletCardTypes } from "@/features/finance/lib/wallet-card-utils";

export const targetResponseSchema = z.object({
  balanceCents: z.number(),
  block: z.boolean(),
  cvc: z.string(),
  id: z.string(),
  name: z.string(),
  numberTarget: z.string(),
  type: z.enum(walletCardTypes),
});

export const targetsGetResponseSchema = z.object({
  targets: z.array(targetResponseSchema).optional(),
});

export const targetMutationResponseSchema = z.object({
  target: targetResponseSchema,
});
