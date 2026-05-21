import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { checkPasswordResetEmail } from "@/features/auth/services/auth-actions";
import { buildForgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/services/auth-validation";
import type { AppLocale } from "@/shared/lib/locale";

type Translate = (key: string) => string;

export function useForgotPasswordForm(t: Translate, locale: AppLocale) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const forgotPasswordSchema = buildForgotPasswordSchema(t);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const submitForgotPassword = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const response = await checkPasswordResetEmail(values, locale);

      if (!response.ok) {
        const message = response.data.error ?? t("forgotPassword.checkEmailError");
        setServerError(message);
        Alert.alert(t("forgotPassword.resetFailed"), message);
        return;
      }

      if (!response.data.exists) {
        const message = t("forgotPassword.emailDoesNotExist");
        setServerError(message);
        Alert.alert(t("forgotPassword.emailNotFound"), message);
        return;
      }

      router.navigate({
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

  return {
    form,
    isPending,
    serverError,
    submitForgotPassword,
  };
}
