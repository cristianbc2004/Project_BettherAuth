import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AuthInput } from "@/components/auth-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { authClient } from "@/lib/auth-client";

export default function TwoFactorVerifyScreen() {
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleVerifyTotp = async () => {
    try {
      setIsPending(true);
      setServerError(null);

      const response = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      });

      if (response.error) {
        const message = response.error.message ?? "The authenticator code is not valid.";
        setServerError(message);
        Alert.alert("Verification failed", message);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setServerError(message);
      Alert.alert("Verification failed", message);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    try {
      setIsPending(true);
      setServerError(null);

      const response = await authClient.twoFactor.verifyBackupCode({
        code,
        trustDevice: true,
      });

      if (response.error) {
        const message = response.error.message ?? "The backup code is not valid.";
        setServerError(message);
        Alert.alert("Verification failed", message);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setServerError(message);
      Alert.alert("Verification failed", message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Two-factor sign in"
      subtitle="Enter the 6-digit code from your authenticator app, or use a backup code if you need recovery access."
      title="Verify it&apos;s you."
    >
      <AuthInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        label="Authenticator or backup code"
        onChangeText={setCode}
        placeholder="123456"
        value={code}
      />

      {serverError ? <Text className="mb-4 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label="Verify authenticator code"
        onPress={() => {
          void handleVerifyTotp();
        }}
      />

      <View className="mt-3">
        <AuthSubmitButton
          isPending={isPending}
          label="Use backup code"
          onPress={() => {
            void handleVerifyBackupCode();
          }}
        />
      </View>

      <Pressable
        className="mt-5"
        onPress={() => {
          router.replace("/sign-in");
        }}
      >
        <Text className="text-center text-sm font-semibold text-coral-500">Back to sign in</Text>
      </Pressable>
    </AuthShell>
  );
}
