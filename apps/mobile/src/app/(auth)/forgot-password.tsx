import { Link } from "expo-router";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useForgotPasswordForm } from "@/features/auth/lib/use-forgot-password-form";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { locale } = useLanguage();
  const { form, isPending, serverError, submitForgotPassword } = useForgotPasswordForm(t, locale);

  return (
    <AuthShell
      backHref="/sign-in"
      eyebrow=""
      subtitle="Enter your email to recover access and continue with the same secure mobile flow."
      title="Recover Your Access."
    >
      <View className="px-4 pb-6 pt-6">
        <View>
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <AuthInput
                autoCapitalize="none"
                autoCorrect={false}
                error={error?.message}
                keyboardType="email-address"
                label={t("authForm.email")}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t("authForm.emailPlaceholder")}
                value={value}
              />
            )}
          />
        </View>

        {serverError ? (
          <View className="mb-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AppText className="text-sm" tone="danger">{serverError}</AppText>
          </View>
        ) : null}

        <AuthSubmitButton
          isPending={isPending}
          label={t("forgotPassword.continue")}
          onPress={() => {
            void submitForgotPassword();
          }}
        />

        <AppText className="mt-6 text-center text-sm" style={{ color: theme.mutedText }}>
          {t("forgotPassword.remembered")}
          <Link href="/sign-in" className="font-bold" style={{ color: theme.primary }}>
            {t("authForm.signIn")}
          </Link>
        </AppText>
      </View>
    </AuthShell>
  );
}
