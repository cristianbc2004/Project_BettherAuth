import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { verifyEmailToken } from "@/features/auth/services/auth-actions";

export function useVerifyEmailToken(token: string) {
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

    void verifyEmailToken(token)
      .then((response) => {
        if (response.error) {
          const message = response.error.message ?? "Could not verify your email.";
          Alert.alert("Verification failed", message);
          router.replace("/sign-in");
          return;
        }

        router.replace("/");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Could not verify your email.";
        Alert.alert("Verification failed", message);
        router.replace("/sign-in");
      });
  }, [hasStarted, token]);
}
