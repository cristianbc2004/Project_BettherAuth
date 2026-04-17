import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";

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

    void authClient.verifyEmail(
      {
        query: {
          token,
        },
      },
      {
        onSuccess: () => {
          router.replace("/");
        },
        onError: (ctx) => {
          const message = ctx.error.message ?? "Could not verify your email.";
          Alert.alert("Verification failed", message);
          router.replace("/sign-in");
        },
      },
    );
  }, [hasStarted, token]);

  return <LoadingScreen />;
}
