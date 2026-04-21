import { Redirect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { DashboardCard } from "@/shared/components/ui/dashboard-card";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";

export default function AdminPanelScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { t } = useTranslation();
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

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          className="mb-6 self-start"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">{t("common.back")}</Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          {t("admin.panelEyebrow")}
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">{t("admin.panelTitle")}</Text>
        <Text className="mt-4 max-w-[340px] text-base leading-6 text-ink-100">
          {t("admin.panelSubtitle")}
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow={t("admin.createEyebrow")} title={t("admin.createTitle")}>
            <Text className="text-base leading-6 text-ink-100">{t("admin.createDescription")}</Text>
            <AuthSubmitButton
              isPending={false}
              label={t("admin.openCreateUser")}
              onPress={() => {
                router.push("/admin/create-user" as never);
              }}
            />
          </DashboardCard>

          <DashboardCard eyebrow={t("admin.directoryEyebrow")} title={t("admin.listTitle")}>
            <Text className="text-base leading-6 text-ink-100">{t("admin.listDescription")}</Text>
            <AuthSubmitButton
              isPending={false}
              label={t("admin.openUserList")}
              onPress={() => {
                router.push("/admin/list-users" as never);
              }}
            />
          </DashboardCard>

          <DashboardCard eyebrow={t("admin.deleteEyebrow")} title={t("admin.deleteTitle")}>
            <Text className="text-base leading-6 text-ink-100">{t("admin.deleteDescription")}</Text>
            <AuthSubmitButton
              isPending={false}
              label={t("admin.openDeleteUser")}
              onPress={() => {
                router.push("/admin/delete-user" as never);
              }}
            />
          </DashboardCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
