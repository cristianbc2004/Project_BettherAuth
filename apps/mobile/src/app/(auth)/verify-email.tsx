import { useLocalSearchParams } from "expo-router";

import { useVerifyEmailToken } from "@/features/auth/lib/use-verify-email-token";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  useVerifyEmailToken(token);

  return <LoadingScreen />;
}
