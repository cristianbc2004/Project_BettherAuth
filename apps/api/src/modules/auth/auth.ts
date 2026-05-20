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
      defaultLocale: "es",
      detection: ["header"],
      translations: {
        es: {
          EMAIL_NOT_VERIFIED: "El correo electronico no esta verificado.",
          FAILED_TO_CREATE_SESSION: "No se pudo crear la sesion.",
          FAILED_TO_CREATE_USER: "No se pudo crear el usuario.",
          INVALID_EMAIL: "El correo electronico no es valido.",
          INVALID_EMAIL_OR_PASSWORD: "El correo o la contrasena no son validos.",
          INVALID_PASSWORD: "La contrasena no es valida.",
          PASSWORD_TOO_SHORT: "La contrasena es demasiado corta.",
          SESSION_EXPIRED: "La sesion ha expirado.",
          TOO_MANY_REQUESTS: "Demasiados intentos. Intentalo de nuevo mas tarde.",
          USER_NOT_FOUND: "Usuario no encontrado.",
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
