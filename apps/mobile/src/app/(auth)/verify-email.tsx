import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { verifyEmailToken } from "@/features/auth/services/auth-actions";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);

    if (!token) {
      Alert.alert("Verification failed", "Missing verification token.");
      router.replace("/sign-in");
      return;
    }

    void verifyEmailToken(token).then((response) => {
      if (response.error) {
        const message = response.error.message ?? "Could not verify your email.";
        Alert.alert("Verification failed", message);
        router.replace("/sign-in");
        return;
      }

      router.replace("/");
    });
  }, [hasStarted, token]);

  return <LoadingScreen />;
}
