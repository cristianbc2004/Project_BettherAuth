import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

import { appConfig } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

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
    autoSignIn: true,
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  plugins: [
    expo(),
    twoFactor({
      issuer: "Better Auth Dashboard",
    }),
  ],
});
