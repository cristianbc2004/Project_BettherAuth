import { authClient } from "@/features/auth/services/auth-client";
import { buildAuthFetchOptions, type AppLocale } from "@/shared/lib/locale";
import type { AdminUser } from "@repo/types/admin";

type AdminUserRole = "user" | "admin";

type CreateAdminUserInput = {
  email: string;
  name: string;
  password: string;
  role: AdminUserRole;
};

export function createAdminUser(values: CreateAdminUserInput, locale: AppLocale) {
  return authClient.admin.createUser({
    email: values.email,
    password: values.password,
    name: values.name,
    role: values.role,
    ...buildAuthFetchOptions(locale),
  });
}

export async function listAdminUsers(locale: AppLocale) {
  const result = await authClient.admin.listUsers({
    query: {
      limit: 100,
    },
    ...buildAuthFetchOptions(locale),
  });

  if (result.error) {
    return result;
  }

  const payload = result.data as { users?: AdminUser[] } | AdminUser[] | undefined;

  return {
    ...result,
    data: Array.isArray(payload) ? payload : payload?.users ?? [],
  };
}

export function removeAdminUser(userId: string, locale: AppLocale) {
  return authClient.admin.removeUser({
    userId,
    ...buildAuthFetchOptions(locale),
  });
}
