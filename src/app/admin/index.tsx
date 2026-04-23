import { Redirect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import type { ImageSourcePropType } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AdminActionRow } from "@/shared/components/ui/admin/admin-action-row";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";

export default function AdminPanelScreen() {
  const dashboardIcons = {
    createUser: require("../../../assets/newuser.png"),
    deleteUser: require("../../../assets/delete_user.png"),
    listUsers: require("../../../assets/list_user.png"),
  } satisfies Record<string, ImageSourcePropType>;

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
    <AuthShell
      eyebrow=""
      subtitle={`Manage admin actions for ${session.user.email} with the same minimal secure flow.`}
      title={t("admin.panelTitle")}
    >
      <AdminActionRow
        accent="#4b258d"
        description={t("admin.createDescription")}
        eyebrow={t("admin.createEyebrow")}
        icon={dashboardIcons.createUser}
        onPress={() => {
          router.push("/admin/create-user" as never);
        }}
        title={t("admin.createTitle")}
      />
      <AdminActionRow
        accent="#4b258d"
        description={t("admin.listDescription")}
        eyebrow={t("admin.directoryEyebrow")}
        icon={dashboardIcons.listUsers}
        onPress={() => {
          router.push("/admin/list-users" as never);
        }}
        title={t("admin.listTitle")}
      />
      <AdminActionRow
        accent="#4b258d"
        description={t("admin.deleteDescription")}
        eyebrow={t("admin.deleteEyebrow")}
        icon={dashboardIcons.deleteUser}
        onPress={() => {
          router.push("/admin/delete-user" as never);
        }}
        title={t("admin.deleteTitle")}
      />
    </AuthShell>
  );
}
