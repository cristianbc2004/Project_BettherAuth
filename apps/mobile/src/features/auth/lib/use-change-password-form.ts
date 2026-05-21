import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { changePassword } from "@/features/auth/services/auth-actions";
import { buildChangePasswordSchema, type ChangePasswordFormValues } from "@/features/auth/services/auth-validation";
import { successHaptic, warningHaptic } from "@/shared/lib/haptics";
import type { AppLocale } from "@/shared/lib/locale";

type Translate = (key: string) => string;

export function useChangePasswordForm(t: Translate, locale: AppLocale) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPasswordRequirementsFocused, setIsPasswordRequirementsFocused] = useState(false);
  const [passwordRequirementsScrollRequest, setPasswordRequirementsScrollRequest] = useState(0);
  const changePasswordSchema = buildChangePasswordSchema(t);
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const newPasswordValue = form.watch("newPassword");
  const confirmPasswordValue = form.watch("confirmPassword");

  const requestPasswordRequirementsScroll = useCallback(() => {
    setIsPasswordRequirementsFocused(true);
    setPasswordRequirementsScrollRequest((currentValue) => currentValue + 1);
  }, []);

  const handleCurrentPasswordFocus = useCallback(() => {
    setIsPasswordRequirementsFocused(false);
  }, []);

  const submitChangePassword = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const response = await changePassword(values, locale);

      if (response.error) {
        const message = response.error.message ?? t("changePassword.updateError");
        setServerError(message);
        warningHaptic();
        Alert.alert(t("changePassword.updateFailed"), message);
        return;
      }

      successHaptic();
      Alert.alert(t("changePassword.updateSuccessTitle"), t("changePassword.updateSuccessMessage"));
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authForm.networkError");
      setServerError(message);
      warningHaptic();
      Alert.alert(t("changePassword.updateFailed"), message);
    } finally {
      setIsPending(false);
    }
  });

  return {
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
  };
}
