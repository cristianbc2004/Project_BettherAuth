import { expo } from "@better-auth/expo";
import { i18n } from "@better-auth/i18n";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { admin, twoFactor } from "better-auth/plugins";

import { ac, adminRole, userRole } from "@repo/auth";
import { appConfig } from "@repo/config";
import { prisma } from "@repo/database";

import { sendVerificationEmail } from "./email.service";

const trustedOrigins = [
  appConfig.authServerUrl,
  `${appConfig.appScheme}://`,
  `${appConfig.appScheme}://*`,
  ...(process.env.NODE_ENV === "development"
    ? [
        "exp://",
        "exp://**",
        "exp://192.168.*.*:*/**",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
      ]
    : []),
];

export const auth = betterAuth({
  appName: "Better Auth Dashboard",
  baseURL: appConfig.authServerUrl,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins,
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        defaultValue: "user",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token,
        url,
      });
    },
  },
  plugins: [
    expo(),
    i18n({
      defaultLocale: "en",
      detection: ["header"],
      translations: {
        en: {
          EMAIL_NOT_VERIFIED: "The email address is not verified.",
          FAILED_TO_CREATE_SESSION: "Could not create the session.",
          FAILED_TO_CREATE_USER: "Could not create the user.",
          INVALID_EMAIL: "The email address is not valid.",
          INVALID_EMAIL_OR_PASSWORD: "The email or password is not valid.",
          INVALID_PASSWORD: "The password is not valid.",
          PASSWORD_TOO_SHORT: "The password is too short.",
          SESSION_EXPIRED: "The session has expired.",
          TOO_MANY_REQUESTS: "Too many attempts. Please try again later.",
          USER_NOT_FOUND: "User not found.",
        },
      },
    }),
    twoFactor({
      issuer: "Better Auth Dashboard",
    }),
    admin({
      ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
      adminRoles: ["admin"],
    }),
  ],
});
