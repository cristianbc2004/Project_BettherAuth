import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { verifyTotpCode, verifyTwoFactorBackupCode } from "@/features/auth/services/auth-actions";
import { successHaptic, warningHaptic } from "@/shared/lib/haptics";
import type { AppLocale } from "@/shared/lib/locale";

type Translate = (key: string) => string;

export function useTwoFactorVerifyForm(t: Translate, locale: AppLocale) {
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const verify = useCallback(
    async (mode: "totp" | "backup") => {
      try {
        setIsPending(true);
        setServerError(null);

        const response = mode === "totp"
          ? await verifyTotpCode(code, locale)
          : await verifyTwoFactorBackupCode(code, locale);

        if (response.error) {
          const fallbackKey = mode === "totp"
            ? "twoFactorVerify.invalidAuthenticatorCode"
            : "twoFactorVerify.invalidBackupCode";
          const message = response.error.message ?? t(fallbackKey);
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
    },
    [code, locale, t],
  );

  const verifyTotp = useCallback(async () => {
    await verify("totp");
  }, [verify]);

  const verifyBackupCode = useCallback(async () => {
    await verify("backup");
  }, [verify]);

  const goToSignIn = useCallback(() => {
    router.replace("/sign-in");
  }, []);

  return {
    code,
    goToSignIn,
    isPending,
    serverError,
    setCode,
    verifyBackupCode,
    verifyTotp,
  };
}
