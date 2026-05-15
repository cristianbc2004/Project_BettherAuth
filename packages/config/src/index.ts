const stripAuthPath = (value: string) => value.replace(/\/api\/auth\/?$/, "");

const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "better-auth-dashboard";
const authServerUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.EXPO_PUBLIC_BETTER_AUTH_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:8081";

export const appConfig = {
  appName: "Better Auth Dashboard",
  appScheme,
  authApiUrl: stripAuthPath(process.env.EXPO_PUBLIC_API_URL ?? authServerUrl),
  authServerUrl,
  resendTestRecipient: process.env.EXPO_PUBLIC_RESEND_TEST_EMAIL?.trim().toLowerCase() ?? "",
  emailVerificationAppUrl:
    process.env.EXPO_PUBLIC_EMAIL_VERIFICATION_APP_URL ??
    `${appScheme}://verify-email`,
  emailVerificationSuccessUrl:
    process.env.EXPO_PUBLIC_EMAIL_VERIFICATION_URL ??
    `${appScheme}://dashboard`,
  resetPasswordUrl:
    process.env.EXPO_PUBLIC_RESET_PASSWORD_URL ??
    `${appScheme}://reset-password`,
} as const;
