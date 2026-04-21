import { Redirect } from "expo-router";

import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";

export default function IndexScreen() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (session?.user) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/sign-in" />;
}
