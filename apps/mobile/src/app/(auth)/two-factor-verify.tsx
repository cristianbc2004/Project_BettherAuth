import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useTwoFactorVerifyForm } from "@/features/auth/lib/use-two-factor-verify-form";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

export default function TwoFactorVerifyScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { locale } = useLanguage();
  const { code, goToSignIn, isPending, serverError, setCode, verifyBackupCode, verifyTotp } =
    useTwoFactorVerifyForm(t, locale);

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
          void verifyTotp();
        }}
      />

      <View className="mt-3">
        <AuthSubmitButton
          isPending={isPending}
          label={t("twoFactorVerify.useBackupCode")}
          onPress={() => {
            void verifyBackupCode();
          }}
        />
      </View>

      <Pressable
        className="mt-5"
        onPress={goToSignIn}
      >
        <AppText className="text-center text-sm font-semibold" style={{ color: theme.text }}>{t("twoFactorVerify.backToSignIn")}</AppText>
      </Pressable>
    </AuthShell>
  );
}
