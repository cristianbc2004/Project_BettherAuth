import { z } from "zod";

type Translate = (key: string) => string;

export function buildSignInSchema(t: Translate) {
  return z.object({
    email: z.email(t("authForm.invalidEmail")),
    password: z.string().min(8, t("authForm.minPassword")),
  });
}

export function buildSignUpSchema(t: Translate) {
  return z.object({
    name: z.string().min(2, t("authForm.minName")),
    email: z.email(t("authForm.invalidEmail")),
    password: z
      .string()
      .min(8, t("authForm.minPassword"))
      .regex(/[A-Z]/, t("authForm.passwordNeedsUppercase"))
      .regex(/[a-z]/, t("authForm.passwordNeedsLowercase"))
      .regex(/\d/, t("authForm.passwordNeedsNumber")),
  });
}

export function buildChangePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: z.string().min(8, t("changePassword.currentPasswordMin")),
      newPassword: z
        .string()
        .min(8, t("changePassword.newPasswordMin"))
        .regex(/[A-Z]/, t("authForm.passwordNeedsUppercase"))
        .regex(/[a-z]/, t("authForm.passwordNeedsLowercase"))
        .regex(/\d/, t("authForm.passwordNeedsNumber")),
      confirmPassword: z.string().min(8, t("changePassword.confirmNewPassword")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("changePassword.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
}

export function buildForgotPasswordSchema(t: Translate) {
  return z.object({
    email: z.email(t("authForm.invalidEmail")),
  });
}

export function buildResetPasswordSchema(t: Translate) {
  return z
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
}

export type SignInFormValues = z.infer<ReturnType<typeof buildSignInSchema>>;
export type SignUpFormValues = z.infer<ReturnType<typeof buildSignUpSchema>>;
export type ChangePasswordFormValues = z.infer<ReturnType<typeof buildChangePasswordSchema>>;
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof buildForgotPasswordSchema>>;
export type ResetPasswordFormValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>;
