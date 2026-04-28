import { Redirect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View, type ImageSourcePropType } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AdminActionRow } from "@/shared/components/ui/admin/admin-action-row";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function AdminPanelScreen() {
  const dashboardIcons = {
    createUser: require("../../../assets/newuser.png"),
    deleteUser: require("../../../assets/delete_user.png"),
    listUsers: require("../../../assets/list_user.png"),
  } satisfies Record<string, ImageSourcePropType>;

  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const sessionRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = sessionRole
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

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
      backHref="/dashboard"
      eyebrow=""
      subtitle={`Manage admin actions for ${session.user.email} with the same minimal secure flow.`}
      title={t("admin.panelTitle")}
    >
      <View>
        <AdminActionRow
          accent="#40245f"
          description={t("admin.createDescription")}
          eyebrow={t("admin.createEyebrow")}
          icon={dashboardIcons.createUser}
          onPress={() => {
            router.navigate("/admin/create-user" as never);
          }}
          title={t("admin.createTitle")}
        />
        <View className="mx-2 h-px" style={{ backgroundColor: theme.border }} />
        <AdminActionRow
          accent="#1f3640"
          description={t("admin.listDescription")}
          eyebrow={t("admin.directoryEyebrow")}
          icon={dashboardIcons.listUsers}
          onPress={() => {
            router.navigate("/admin/list-users" as never);
          }}
          title={t("admin.listTitle")}
        />
        <View className="mx-2 h-px" style={{ backgroundColor: theme.border }} />
        <AdminActionRow
          accent="#42311f"
          description={t("admin.deleteDescription")}
          eyebrow={t("admin.deleteEyebrow")}
          icon={dashboardIcons.deleteUser}
          onPress={() => {
            router.navigate("/admin/delete-user" as never);
          }}
          title={t("admin.deleteTitle")}
        />
      </View>
    </AuthShell>
  );
}
