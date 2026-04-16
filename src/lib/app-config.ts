const stripAuthPath = (value: string) => value.replace(/\/api\/auth\/?$/, "");

export const appConfig = {
  appName: "Better Auth Dashboard",
  appScheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? "better-auth-dashboard",
  authApiUrl: stripAuthPath(process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8081"),
  authServerUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:8081",
  resetPasswordUrl:
    process.env.EXPO_PUBLIC_RESET_PASSWORD_URL ??
    `${process.env.EXPO_PUBLIC_APP_SCHEME ?? "better-auth-dashboard"}://reset-password`,
} as const;
