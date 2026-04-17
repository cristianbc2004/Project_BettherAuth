import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient, adminClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

import { appConfig } from "@/lib/app-config";
import { ac, adminRole, userRole } from "@/lib/permissions";

export const authClient = createAuthClient({
  baseURL: appConfig.authApiUrl,
  plugins: [
    expoClient({
      scheme: appConfig.appScheme,
      storagePrefix: "better-auth-dashboard",
      storage: SecureStore,
    }),
    twoFactorClient(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),
  ],
});
