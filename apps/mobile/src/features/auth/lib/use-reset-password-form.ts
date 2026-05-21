import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { resetPasswordDirect } from "@/features/auth/services/auth-actions";
import { buildResetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/services/auth-validation";
import type { AppLocale } from "@/shared/lib/locale";

type Translate = (key: string) => string;

export function useResetPasswordForm(t: Translate, locale: AppLocale, email: string) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const resetPasswordSchema = buildResetPasswordSchema(t);
  const form = useForm<ResetPasswordFormValues>({
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

  const submitResetPassword = form.handleSubmit(async (values) => {
    try {
      if (!email) {
        const message = t("resetPassword.missingEmail");
        setServerError(message);
        Alert.alert(t("resetPassword.resetFailed"), message);
        return;
      }

      setServerError(null);
      setIsPending(true);

      const response = await resetPasswordDirect(email, values, locale);

      if (!response.ok) {
        const message = response.data.error ?? t("resetPassword.resetError");
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

  return {
    confirmPasswordValue,
    form,
    isPending,
    newPasswordValue,
    serverError,
    submitResetPassword,
  };
}
