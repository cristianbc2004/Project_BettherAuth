import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";

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
  const form = useForm<z.infer<typeof changePasswordSchema>>({
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
      eyebrow=""
      subtitle="Update your password and keep your account protected with the same secure mobile flow."
      title="Change Your Password."
    >
      <View className="px-4 pb-6 pt-6">
        <Text className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
          {t("changePassword.keepSecure")}
        </Text>
        <Text className="mt-2 text-[15px] leading-6" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
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

        {serverError ? (
          <View className="mb-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <Text className="text-sm text-red-300">{serverError}</Text>
          </View>
        ) : null}

        <AuthSubmitButton
          isPending={isPending}
          label={t("changePassword.updatePassword")}
          onPress={() => {
            void handleSubmit();
          }}
        />
      </View>
    </AuthShell>
  );
}
