import { Redirect } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { authClient } from "@/features/auth/services/auth-client";
import { AdminMinimalPanel, AdminMinimalSection } from "@/shared/components/ui/admin/admin-minimal-panel";
import { AdminUserNotificationRow } from "@/shared/components/ui/admin/admin-user-notification-row";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { StatusMessage } from "@/shared/components/ui/status-message";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

export default function ListUsersScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const sessionRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = sessionRole
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.role ?? "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search, users]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setErrorMessage(null);

    const result = await authClient.admin.listUsers({
      query: {
        limit: 100,
      },
      ...buildAuthFetchOptions(locale),
    });

    setIsLoadingUsers(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? t("admin.loadUsersError"));
      return;
    }

    const payload = result.data as { users?: AdminUser[] } | AdminUser[] | undefined;
    setUsers(Array.isArray(payload) ? payload : payload?.users ?? []);
  };

  useEffect(() => {
    if (session?.user && isAdmin) {
      void loadUsers();
    }
  }, [isAdmin, locale, session?.user]);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!isAdmin) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <AuthShell
      eyebrow=""
      subtitle={`Manage admin actions for ${session.user.email} with the same minimal secure flow.`}
      title={t("admin.listPageTitle")}
    >
      {errorMessage ? <StatusMessage message={errorMessage} tone="error" /> : null}

      <AdminMinimalPanel>
        <AdminMinimalSection title={t("admin.search")}>
          <AuthInput
            autoCapitalize="none"
            autoCorrect={false}
            label={t("admin.search")}
            onChangeText={setSearch}
            placeholder={t("admin.searchPlaceholder")}
            value={search}
          />

          <AuthSubmitButton
            isPending={isLoadingUsers}
            label={t("admin.refreshUsers")}
            onPress={() => {
              void loadUsers();
            }}
          />
        </AdminMinimalSection>

        <AdminMinimalSection title={t("admin.listTitle")} description={t("admin.listDescription")}>
          <View className="gap-3">
            {filteredUsers.length ? (
              <View className="overflow-hidden rounded-[28px] border border-white/5 bg-transparent">
                {filteredUsers.map((user, index) => (
                  <View key={user.id}>
                    <AdminUserNotificationRow
                      email={user.email}
                      name={user.name}
                      role={user.role}
                      statusLabel={user.banned ? t("common.banned") : t("common.active")}
                    />
                    {index < filteredUsers.length - 1 ? <View className="mx-2 h-px bg-white/8" /> : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-[15px] leading-6 text-white/60">
                {t("admin.noUsersFound")}
              </Text>
            )}
          </View>
        </AdminMinimalSection>
      </AdminMinimalPanel>
    </AuthShell>
  );
}
