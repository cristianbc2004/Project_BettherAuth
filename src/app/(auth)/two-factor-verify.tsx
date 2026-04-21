import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";

export default function TwoFactorVerifyScreen() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { locale } = useLanguage();

  const handleVerifyTotp = async () => {
    try {
      setIsPending(true);
      setServerError(null);

      const response = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
        ...buildAuthFetchOptions(locale),
      });

      if (response.error) {
        const message = response.error.message ?? t("twoFactorVerify.invalidAuthenticatorCode");
        setServerError(message);
        Alert.alert(t("twoFactorVerify.verificationFailed"), message);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("twoFactorVerify.networkError");
      setServerError(message);
      Alert.alert(t("twoFactorVerify.verificationFailed"), message);
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
        ...buildAuthFetchOptions(locale),
      });

      if (response.error) {
        const message = response.error.message ?? t("twoFactorVerify.invalidBackupCode");
        setServerError(message);
        Alert.alert(t("twoFactorVerify.verificationFailed"), message);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("twoFactorVerify.networkError");
      setServerError(message);
      Alert.alert(t("twoFactorVerify.verificationFailed"), message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t("authShell.twoFactorVerify.eyebrow")}
      subtitle={t("authShell.twoFactorVerify.subtitle")}
      title={t("authShell.twoFactorVerify.title")}
    >
      <AuthInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        label={t("twoFactorVerify.codeLabel")}
        onChangeText={setCode}
        placeholder={t("twoFactor.sixDigitCodePlaceholder")}
        value={code}
      />

      {serverError ? <Text className="mb-4 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label={t("twoFactorVerify.verifyAuthenticator")}
        onPress={() => {
          void handleVerifyTotp();
        }}
      />

      <View className="mt-3">
        <AuthSubmitButton
          isPending={isPending}
          label={t("twoFactorVerify.useBackupCode")}
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
        <Text className="text-center text-sm font-semibold text-coral-500">{t("twoFactorVerify.backToSignIn")}</Text>
      </Pressable>
    </AuthShell>
  );
}
