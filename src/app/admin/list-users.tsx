import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/features/auth/components/auth-input";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { DashboardCard } from "@/shared/components/ui/dashboard-card";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

export default function ListUsersScreen() {
  const { data: session, isPending } = authClient.useSession();
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

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!isAdmin) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable className="mb-6 self-start" onPress={() => router.back()}>
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">{t("common.back")}</Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          {t("admin.listEyebrow")}
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">{t("admin.listPageTitle")}</Text>
        <Text className="mt-4 max-w-[340px] text-base leading-6 text-ink-100">
          {t("admin.listPageSubtitle")}
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow={t("admin.directoryEyebrow")} title={t("admin.listTitle")}>
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label={t("admin.search")}
              onChangeText={setSearch}
              placeholder={t("admin.searchPlaceholder")}
              value={search}
            />

            <View className="mb-4">
              <AuthSubmitButton
                isPending={isLoadingUsers}
                label={t("admin.refreshUsers")}
                onPress={() => {
                  void loadUsers();
                }}
              />
            </View>

            <View className="gap-3">
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <View className="rounded-3xl bg-ink-800/80 p-4" key={user.id}>
                    <Text className="text-lg font-bold text-white">{user.name}</Text>
                    <Text className="mt-1 text-base text-ink-100">{user.email}</Text>
                    <Text className="mt-2 text-sm font-semibold uppercase tracking-[2px] text-coral-300">
                      {t("common.roleLabel", { role: user.role ?? "user" })}
                    </Text>
                    <Text className="mt-1 text-sm text-ink-100">
                      {t("common.statusLabel", {
                        status: user.banned ? t("common.banned") : t("common.active"),
                      })}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-base leading-6 text-ink-100">
                  {t("admin.noUsersFound")}
                </Text>
              )}
            </View>
          </DashboardCard>

          {errorMessage ? (
            <View className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
              <Text className="text-base leading-6 text-red-100">{errorMessage}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
