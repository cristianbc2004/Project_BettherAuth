import { useLocalSearchParams } from "expo-router";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useResetPasswordForm } from "@/features/auth/lib/use-reset-password-form";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const { locale } = useLanguage();
  const {
    confirmPasswordValue,
    form,
    isPending,
    newPasswordValue,
    serverError,
    submitResetPassword,
  } = useResetPasswordForm(t, locale, email);

  return (
    <AuthShell
      backHref="/sign-in"
      eyebrow={t("authShell.resetPassword.eyebrow")}
      subtitle={t("authShell.resetPassword.subtitle", { email: email || t("authForm.email") })}
      title={t("authShell.resetPassword.title")}
    >
      <View>
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label={t("authForm.newPassword")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("changePassword.newPasswordPlaceholder")}
              value={value}
            />
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label={t("changePassword.confirmNewPassword")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("resetPassword.repeatPasswordPlaceholder")}
              value={value}
            />
          )}
        />
        <PasswordRequirements
          confirmPassword={confirmPasswordValue}
          password={newPasswordValue}
          showMatch
        />
      </View>

      {serverError ? <AppText className="mb-2 text-sm" style={{ color: theme.danger }}>{serverError}</AppText> : null}

      <AuthSubmitButton
        isPending={isPending}
        label={t("resetPassword.updatePassword")}
        onPress={() => {
          void submitResetPassword();
        }}
      />
    </AuthShell>
  );
}
