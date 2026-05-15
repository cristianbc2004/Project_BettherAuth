import { Redirect } from "expo-router";

import { authClient } from "@/features/auth/services/auth-client";
import { StartupSplashScreen } from "@/shared/components/ui/startup-splash-screen";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function IndexScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);

  if (showSessionLoading) {
    return <StartupSplashScreen />;
  }

  if (session?.user) {
    return <Redirect href={"/home" as never} />;
  }

  return <Redirect href="/sign-in" />;
}
