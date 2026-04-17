import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthPasswordInput } from "@/components/auth-password-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { authClient } from "@/lib/auth-client";
import { buildAuthFetchOptions, useLanguage } from "@/lib/locale";

type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { locale } = useLanguage();
  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(8, t("changePassword.currentPasswordMin")),
      newPassword: z.string().min(8, t("changePassword.newPasswordMin")),
      confirmPassword: z.string().min(8, t("changePassword.confirmNewPassword")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("changePassword.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const response = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
        ...buildAuthFetchOptions(locale),
      });

      if (response.error) {
        const message = response.error.message ?? t("changePassword.updateError");
        setServerError(message);
        Alert.alert(t("changePassword.updateFailed"), message);
        return;
      }

      Alert.alert(t("changePassword.updateSuccessTitle"), t("changePassword.updateSuccessMessage"));
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authForm.networkError");
      setServerError(message);
      Alert.alert(t("changePassword.updateFailed"), message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthShell
      eyebrow={t("authShell.changePassword.eyebrow")}
      subtitle={t("authShell.changePassword.subtitle")}
      title={t("authShell.changePassword.title")}
    >
      <Text className="text-2xl font-black text-ink-900">{t("changePassword.keepSecure")}</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">
        {t("changePassword.description")}
      </Text>

      <View className="mt-6">
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label={t("authForm.currentPassword")}
              onBlur={onBlur}
              onChangeText={onChange}
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
              placeholder={t("changePassword.confirmPasswordPlaceholder")}
              value={value}
            />
          )}
        />
      </View>

      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label={t("changePassword.updatePassword")}
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthShell>
  );
}
