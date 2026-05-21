import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { verifyTotpCode, verifyTwoFactorBackupCode } from "@/features/auth/services/auth-actions";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { successHaptic, warningHaptic } from "@/shared/lib/haptics";
import { useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

export default function TwoFactorVerifyScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { locale } = useLanguage();

  const handleVerifyTotp = async () => { 
    try {
      setIsPending(true);
      setServerError(null);

      const response = await verifyTotpCode(code, locale);

      if (response.error) {
        const message = response.error.message ?? t("twoFactorVerify.invalidAuthenticatorCode");
        setServerError(message);
        warningHaptic();
        Alert.alert(t("twoFactorVerify.verificationFailed"), message);
        return;
      }

      successHaptic();
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("twoFactorVerify.networkError");
      setServerError(message);
      warningHaptic();
      Alert.alert(t("twoFactorVerify.verificationFailed"), message);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    try {
      setIsPending(true);
      setServerError(null);

      const response = await verifyTwoFactorBackupCode(code, locale);

      if (response.error) {
        const message = response.error.message ?? t("twoFactorVerify.invalidBackupCode");
        setServerError(message);
        warningHaptic();
        Alert.alert(t("twoFactorVerify.verificationFailed"), message);
        return;
      }

      successHaptic();
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("twoFactorVerify.networkError");
      setServerError(message);
      warningHaptic();
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

      {serverError ? <AppText className="mb-4 text-sm" style={{ color: theme.danger }}>{serverError}</AppText> : null}

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
        <AppText className="text-center text-sm font-semibold" style={{ color: theme.text }}>{t("twoFactorVerify.backToSignIn")}</AppText>
      </Pressable>
    </AuthShell>
  );
}
