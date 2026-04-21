import { Redirect } from "expo-router";

import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";

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
