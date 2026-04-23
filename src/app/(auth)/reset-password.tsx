import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { appConfig } from "@/shared/lib/app-config";
import { buildLanguageHeaders, useLanguage } from "@/shared/lib/locale";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { locale } = useLanguage();
  const resetPasswordSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, t("resetPassword.passwordMin"))
        .regex(/[A-Z]/, t("authForm.passwordNeedsUppercase"))
        .regex(/[a-z]/, t("authForm.passwordNeedsLowercase"))
        .regex(/\d/, t("authForm.passwordNeedsNumber")),
      confirmPassword: z.string().min(8, t("resetPassword.confirmNewPassword")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("resetPassword.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const newPasswordValue = form.watch("newPassword");
  const confirmPasswordValue = form.watch("confirmPassword");

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (!email) {
        const message = t("resetPassword.missingEmail");
        setServerError(message);
        Alert.alert(t("resetPassword.resetFailed"), message);
        return;
      }

      setServerError(null);
      setIsPending(true);

      const response = await fetch(`${appConfig.authApiUrl}/api/password/reset-direct`, {
        method: "POST",
        headers: {
          ...buildLanguageHeaders(locale),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword: values.newPassword,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        const message = data.error ?? t("resetPassword.resetError");
        setServerError(message);
        Alert.alert(t("resetPassword.resetFailed"), message);
        return;
      }

      Alert.alert(t("resetPassword.updateSuccessTitle"), t("resetPassword.updateSuccessMessage"));
      router.replace("/sign-in");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authForm.networkError");
      setServerError(message);
      Alert.alert(t("resetPassword.resetFailed"), message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthShell
      eyebrow={t("authShell.resetPassword.eyebrow")}
      subtitle={t("authShell.resetPassword.subtitle", { email: email || t("authForm.email") })}
      title={t("authShell.resetPassword.title")}
    >
      <Text className="text-2xl font-black text-ink-900">{t("resetPassword.createNewPassword")}</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">
        {t("resetPassword.description")}
      </Text>

      <View className="mt-6">
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

      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label={t("resetPassword.updatePassword")}
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthShell>
  );
}
