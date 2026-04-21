import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/components/auth-input";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";
import { buildAuthFetchOptions, useLanguage } from "@/lib/locale";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

export default function DeleteUserScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    setMessage(null);
    setErrorMessage(null);

    const result = await authClient.admin.removeUser({
      userId,
      ...buildAuthFetchOptions(locale),
    });

    setDeletingUserId(null);

    if (result.error) {
      setErrorMessage(result.error.message ?? t("admin.removeError"));
      return;
    }

    setMessage(t("admin.removeSuccess"));
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
  };

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
          {t("admin.deletePageEyebrow")}
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">{t("admin.deletePageTitle")}</Text>
        <Text className="mt-4 max-w-[340px] text-base leading-6 text-ink-100">
          {t("admin.deletePageSubtitle")}
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow={t("admin.dangerEyebrow")} title={t("admin.dangerTitle")}>
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
                filteredUsers.map((user) => {
                  const isCurrentUser = user.id === session.user.id;

                  return (
                    <View className="rounded-3xl bg-ink-800/80 p-4" key={user.id}>
                      <Text className="text-lg font-bold text-white">{user.name}</Text>
                      <Text className="mt-1 text-base text-ink-100">{user.email}</Text>
                      <Text className="mt-2 text-sm font-semibold uppercase tracking-[2px] text-coral-300">
                        {t("common.roleLabel", { role: user.role ?? "user" })}
                      </Text>

                      <View className="mt-4">
                        <AuthSubmitButton
                          isPending={deletingUserId === user.id}
                          label={isCurrentUser ? t("admin.cannotRemoveSelf") : t("admin.removeUser")}
                          onPress={() => {
                            if (!isCurrentUser) {
                              void handleDeleteUser(user.id);
                            }
                          }}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text className="text-base leading-6 text-ink-100">
                  {t("admin.noUsersFound")}
                </Text>
              )}
            </View>
          </DashboardCard>

          {message ? (
            <View className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <Text className="text-base leading-6 text-emerald-100">{message}</Text>
            </View>
          ) : null}

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
