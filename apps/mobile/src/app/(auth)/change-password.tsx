import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { useChangePasswordForm } from "@/features/auth/lib/use-change-password-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { useLanguage } from "@/shared/lib/locale";
import { AppText } from "@/shared/components/ui/app-text";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const {
    confirmPasswordValue,
    form,
    handleCurrentPasswordFocus,
    isPasswordRequirementsFocused,
    isPending,
    newPasswordValue,
    passwordRequirementsScrollRequest,
    requestPasswordRequirementsScroll,
    serverError,
    submitChangePassword,
  } = useChangePasswordForm(t, locale);

  return (
    <AuthShell
      backHref="/dashboard"
      eyebrow=""
      keyboardFocusScrollY={isPasswordRequirementsFocused ? 360 : undefined}
      scrollRequestKey={isPasswordRequirementsFocused ? passwordRequirementsScrollRequest : undefined}
      subtitle=""
      title="Change your password."
    >
      <View className="px-4 pb-6 pt-6">
        <View>
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label={t("authForm.currentPassword")}
              onBlur={onBlur}
              onChangeText={onChange}
              onFocus={handleCurrentPasswordFocus}
              placeholder={t("changePassword.currentPasswordPlaceholder")}
              value={value}
            />
          )}
        />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label={t("authForm.newPassword")}
              onBlur={onBlur}
              onChangeText={onChange}
              onFocus={requestPasswordRequirementsScroll}
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
              onFocus={requestPasswordRequirementsScroll}
              placeholder={t("changePassword.confirmPasswordPlaceholder")}
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

        {serverError ? (
          <View className="mb-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AppText className="text-sm" tone="danger">{serverError}</AppText>
          </View>
        ) : null}

        <AuthSubmitButton
          isPending={isPending}
          label={t("changePassword.updatePassword")}
          onPress={() => {
            void submitChangePassword();
          }}
        />
      </View>
    </AuthShell>
  );
}
