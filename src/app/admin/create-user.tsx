import { Redirect, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/features/auth/components/auth-input";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { DashboardCard } from "@/shared/components/ui/dashboard-card";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";

export default function CreateUserScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const sessionRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = sessionRole
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!isAdmin) {
    return <Redirect href="/dashboard" />;
  }

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    setMessage(null);
    setErrorMessage(null);

    const result = await authClient.admin.createUser({
      email,
      password,
      name,
      role,
      ...buildAuthFetchOptions(locale),
    });

    setIsCreatingUser(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? t("admin.createError"));
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setMessage(t("admin.createSuccess"));
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
          {t("admin.createPageEyebrow")}
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">{t("admin.createPageTitle")}</Text>
        <Text className="mt-4 max-w-[340px] text-base leading-6 text-ink-100">
          {t("admin.createPageSubtitle")}
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow={t("admin.formEyebrow")} title={t("admin.formTitle")}>
            <AuthInput
              autoCapitalize="words"
              autoCorrect={false}
              label={t("authForm.fullName")}
              onChangeText={setName}
              placeholder={t("authForm.namePlaceholder")}
              value={name}
            />
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              label={t("authForm.email")}
              onChangeText={setEmail}
              placeholder={t("authForm.emailPlaceholder")}
              value={email}
            />
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label={t("authForm.password")}
              onChangeText={setPassword}
              placeholder={t("authForm.passwordPlaceholder")}
              secureTextEntry
              value={password}
            />
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label={t("admin.role")}
              onChangeText={(value) => {
                setRole(value?.trim().toLowerCase() === "admin" ? "admin" : "user");
              }}
              placeholder={t("admin.rolePlaceholder")}
              value={role}
            />

            <AuthSubmitButton
              isPending={isCreatingUser}
              label={t("admin.createUser")}
              onPress={() => {
                void handleCreateUser();
              }}
            />
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
