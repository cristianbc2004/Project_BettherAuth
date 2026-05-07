import { authClient } from "@/features/auth/services/auth-client";
import { appConfig } from "@/shared/lib/app-config";

export type BizumContact = {
  detail: string;
  id: string;
  initials: string;
  name: string;
};

export type BizumActionMode = "request" | "send";

export type BizumMovementResponse = {
  amount: string;
  createdAt: string;
  id: string;
  initials: string;
  name: string;
  tone: "income" | "outcome";
};

export type BizumGetResponse = {
  availableBalanceCents: number;
  contacts: BizumContact[];
  movements: BizumMovementResponse[];
};

export type BizumPostResponse = {
  availableBalanceCents: number;
  request?: { amountCents: number; id: string };
  transfer?: BizumMovementResponse;
};

function getAuthCookie() {
  return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
}

export function buildIdempotencyKey(scope: "bizum-send") {
  const random = Math.random().toString(36).slice(2, 12);
  return `${scope}-${Date.now()}-${random}`;
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
