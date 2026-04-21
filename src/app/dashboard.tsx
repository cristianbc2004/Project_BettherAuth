import { Redirect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";
import { buildAuthFetchOptions, useLanguage } from "@/lib/locale";


export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = role
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          {t("dashboard.eyebrow")}
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">
          {t("dashboard.greeting", { name: session.user.name.split(" ")[0] })}
        </Text>
        <Text className="mt-4 max-w-[320px] text-base leading-6 text-ink-100">
          {t("dashboard.subtitle")}
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow={t("dashboard.profileTitle")} title={session.user.email}>
            <Text className="text-base leading-6 text-ink-100">
              {t("dashboard.profileDescription", { name: session.user.name })}
            </Text>
            <Text className="mt-3 text-sm font-semibold uppercase tracking-[2px] text-coral-300">
              {t("common.roleLabel", { role })}
            </Text>
          </DashboardCard>

          <DashboardCard eyebrow={t("dashboard.backendEyebrow")} title={t("dashboard.backendTitle")}>
            <Text className="text-base leading-6 text-ink-100">{t("dashboard.backendDescription")}</Text>
          </DashboardCard>

          <DashboardCard eyebrow={t("dashboard.securityEyebrow")} title={t("dashboard.changePasswordTitle")}>
            <Text className="text-base leading-6 text-ink-100">
              {t("dashboard.changePasswordDescription")}
            </Text>
            <View className="mt-4">
              <AuthSubmitButton
                isPending={false}
                label={t("dashboard.openPasswordSettings")}
                onPress={() => {
                  router.push("/change-password" as never);
                }}
              />
            </View>
          </DashboardCard>

          <DashboardCard eyebrow={t("dashboard.securityEyebrow")} title={t("dashboard.twoFactorTitle")}>
            <Text className="text-base leading-6 text-ink-100">{t("dashboard.twoFactorDescription")}</Text>
            <View className="mt-4">
              <AuthSubmitButton
                isPending={false}
                label={t("dashboard.openTwoFactor")}
                onPress={() => {
                  router.push("/two-factor" as never);
                }}
              />
            </View>
          </DashboardCard>

          {isAdmin ? (
            <DashboardCard eyebrow={t("dashboard.adminEyebrow")} title={t("dashboard.adminTitle")}>
              <Text className="text-base leading-6 text-ink-100">{t("dashboard.adminDescription")}</Text>
              <View className="mt-4">
                <AuthSubmitButton
                  isPending={false}
                  label={t("dashboard.openAdmin")}
                  onPress={() => {
                    router.push("/admin" as never);
                  }}
                />
              </View>
            </DashboardCard>
          ) : null}
        </View>

        <View className="mt-8">
          <AuthSubmitButton
            isPending={false}
            label={t("dashboard.signOut")}
            onPress={() => {
              void authClient.signOut({
                ...buildAuthFetchOptions(locale),
                fetchOptions: {
                  headers: buildAuthFetchOptions(locale).fetchOptions.headers,
                  onSuccess: () => {
                    router.replace("/sign-in");
                  },
                },
              });
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
