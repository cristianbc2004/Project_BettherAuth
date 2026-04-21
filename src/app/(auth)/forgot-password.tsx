import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { appConfig } from "@/shared/lib/app-config";
import { buildLanguageHeaders, useLanguage } from "@/shared/lib/locale";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { locale } = useLanguage();
  const forgotPasswordSchema = z.object({
    email: z.email(t("authForm.invalidEmail")),
  });
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const checkEmailUrl = new URL("/api/password/check-email", appConfig.authApiUrl);
      checkEmailUrl.searchParams.set("email", values.email);

      const response = await fetch(checkEmailUrl.toString(), {
        headers: buildLanguageHeaders(locale),
      });

      const data = (await response.json()) as { exists?: boolean; error?: string };

      if (!response.ok) {
        const message = data.error ?? t("forgotPassword.checkEmailError");
        setServerError(message);
        Alert.alert(t("forgotPassword.resetFailed"), message);
        return;
      }

      if (!data.exists) {
        const message = t("forgotPassword.emailDoesNotExist");
        setServerError(message);
        Alert.alert(t("forgotPassword.emailNotFound"), message);
        return;
      }

      router.push({
        pathname: "/reset-password" as never,
        params: {
          email: values.email,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authForm.networkError");
      setServerError(message);
      Alert.alert(t("forgotPassword.resetFailed"), message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthShell
      eyebrow={t("authShell.forgotPassword.eyebrow")}
      subtitle={t("authShell.forgotPassword.subtitle")}
      title={t("authShell.forgotPassword.title")}
    >
      <Text className="text-2xl font-black text-ink-900">{t("forgotPassword.recoverAccess")}</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">
        {t("forgotPassword.recoverDescription")}
      </Text>

      <View className="mt-6">
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

      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label={t("forgotPassword.continue")}
        onPress={() => {
          void handleSubmit();
        }}
      />

      <Text className="mt-6 text-center text-sm text-ink-600">
        {t("forgotPassword.remembered")}
        <Link href="/sign-in" className="font-bold text-coral-500">
          {t("authForm.signIn")}
        </Link>
      </Text>
    </AuthShell>
  );
}
