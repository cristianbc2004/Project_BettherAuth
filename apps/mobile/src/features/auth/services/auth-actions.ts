import { appConfig } from "@repo/config";

import { authClient } from "@/features/auth/services/auth-client";
import type { ChangePasswordFormValues, SignInFormValues, SignUpFormValues } from "@/features/auth/services/auth-validation";
import { buildAuthFetchOptions, type AppLocale } from "@/shared/lib/locale";

export function signInWithEmail(values: SignInFormValues, locale: AppLocale) {
  return authClient.signIn.email({
    ...values,
    ...buildAuthFetchOptions(locale),
  });
}

export function signUpWithEmail(values: SignUpFormValues, locale: AppLocale) {
  return authClient.signUp.email({
    ...values,
    callbackURL: appConfig.emailVerificationSuccessUrl,
    ...buildAuthFetchOptions(locale),
  });
}

export function canSendVerificationEmail(email: string) {
  return (
    !appConfig.resendTestRecipient ||
    email.trim().toLowerCase() === appConfig.resendTestRecipient
  );
}

export function getResendTestRecipient() {
  return appConfig.resendTestRecipient;
}

export function changePassword(values: ChangePasswordFormValues, locale: AppLocale) {
  return authClient.changePassword({
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
    revokeOtherSessions: true,
    ...buildAuthFetchOptions(locale),
  });
}

export function verifyEmailToken(token: string) {
  return authClient.verifyEmail({
    query: {
      token,
    },
  });
}

export function verifyTotpCode(code: string, locale: AppLocale) {
  return authClient.twoFactor.verifyTotp({
    code,
    trustDevice: true,
    ...buildAuthFetchOptions(locale),
  });
}

export function verifyTwoFactorBackupCode(code: string, locale: AppLocale) {
  return authClient.twoFactor.verifyBackupCode({
    code,
    trustDevice: true,
    ...buildAuthFetchOptions(locale),
  });
}
