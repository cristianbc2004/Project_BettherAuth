import { authClient } from "@/features/auth/services/auth-client";

export function getAuthCookie() {
    return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
  }