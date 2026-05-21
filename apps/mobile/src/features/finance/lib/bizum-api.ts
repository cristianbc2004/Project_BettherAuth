import { authClient } from "@/features/auth/services/auth-client";
import { appConfig } from "@repo/config";
import { z } from "zod";

export const bizumContactSchema = z.object({
  detail: z.string(),
  id: z.string(),
  initials: z.string(),
  name: z.string(),
});

export const bizumActionModeSchema = z.enum(["request", "send"]);

export const bizumMovementResponseSchema = z.object({
  amount: z.string(),
  createdAt: z.string(),
  id: z.string(),
  initials: z.string(),
  name: z.string(),
  tone: z.enum(["income", "outcome"]),
});

export const bizumGetResponseSchema = z.object({
  availableBalanceCents: z.number(),
  contacts: z.array(bizumContactSchema),
  movements: z.array(bizumMovementResponseSchema),
});

export const bizumPostResponseSchema = z.object({
  availableBalanceCents: z.number(),
  request: z.object({ amountCents: z.number(), id: z.string() }).optional(),
  transfer: bizumMovementResponseSchema.optional(),
});

export type BizumActionMode = z.infer<typeof bizumActionModeSchema>;
export type BizumContact = z.infer<typeof bizumContactSchema>;
export type BizumGetResponse = z.infer<typeof bizumGetResponseSchema>;
export type BizumMovementResponse = z.infer<typeof bizumMovementResponseSchema>;
export type BizumPostResponse = z.infer<typeof bizumPostResponseSchema>;

function getAuthCookie() {
  return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
}

export function buildIdempotencyKey(scope: "bizum-send" | "bizum-request-payment", id?: string) {
  const random = Math.random().toString(36).slice(2, 12);
  const keyParts = id ? [scope, id, Date.now(), random] : [scope, Date.now(), random];
  return keyParts.join("-");
}

export async function fetchBizumRequest(path = "/api/bizum", init?: RequestInit) {
  return fetch(`${appConfig.authApiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: getAuthCookie(),
      ...init?.headers,
    },
  });
}
