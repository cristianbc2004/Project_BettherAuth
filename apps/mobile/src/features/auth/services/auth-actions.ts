import { appConfig } from "@repo/config";

import { authClient } from "@/features/auth/services/auth-client";
import type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  SignInFormValues,
  SignUpFormValues,
} from "@/features/auth/services/auth-validation";
import { buildAuthFetchOptions, buildLanguageHeaders, type AppLocale } from "@/shared/lib/locale";

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

export async function checkPasswordResetEmail(values: ForgotPasswordFormValues, locale: AppLocale) {
  const checkEmailUrl = new URL("/api/password/check-email", appConfig.authApiUrl);
  checkEmailUrl.searchParams.set("email", values.email);

  const response = await fetch(checkEmailUrl.toString(), {
    headers: buildLanguageHeaders(locale),
  });

  return {
    data: (await response.json()) as { exists?: boolean; error?: string },
    ok: response.ok,
  };
}

export async function resetPasswordDirect(
  email: string,
  values: ResetPasswordFormValues,
  locale: AppLocale,
) {
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

  return {
    data: (await response.json()) as { success?: boolean; error?: string },
    ok: response.ok,
  };
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
