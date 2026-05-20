import { Redirect } from "expo-router";

import { authClient } from "@/features/auth/services/auth-client";
import { AppDrawer } from "@/shared/components/ui/app-drawer";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

function isAdminRole(role: string) {
  return role
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes("admin");
}

export default function MenuScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const role = (session.user as { role?: string }).role ?? "User";

  return (
    <AppDrawer
      email={session.user.email}
      isAdmin={isAdminRole(role)}
      name={session.user.name}
      role={role}
    />
  );
}
