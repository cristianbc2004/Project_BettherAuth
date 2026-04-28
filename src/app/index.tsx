import { Redirect } from "expo-router";

import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function IndexScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (session?.user) {
    return <Redirect href={"/home" as never} />;
  }

  return <Redirect href="/sign-in" />;
}
