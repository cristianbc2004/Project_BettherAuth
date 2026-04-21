import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { twoFactor, admin } from "better-auth/plugins";
import { i18n } from "@better-auth/i18n";

import { sendVerificationEmail } from "@/features/auth/services/email";
import { ac, adminRole, userRole } from "@/features/auth/services/permissions";
import { appConfig } from "@/shared/lib/app-config";
import { prisma } from "@/shared/lib/prisma";

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
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
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
      defaultLocale: "es",
      detection: ["header"],
      translations: {
        es: {
          USER_NOT_FOUND: "Usuario no encontrado.",
          INVALID_EMAIL: "El correo electrónico no es válido.",
          INVALID_EMAIL_OR_PASSWORD: "El correo o la contraseña no son válidos.",
          INVALID_PASSWORD: "La contraseña no es válida.",
          EMAIL_NOT_VERIFIED: "El correo electrónico no está verificado.",
          SESSION_EXPIRED: "La sesión ha expirado.",
          FAILED_TO_CREATE_USER: "No se pudo crear el usuario.",
          FAILED_TO_CREATE_SESSION: "No se pudo crear la sesión.",
          PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
          TOO_MANY_REQUESTS: "Demasiados intentos. Inténtalo de nuevo más tarde.",
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
