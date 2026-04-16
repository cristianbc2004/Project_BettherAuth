import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { appConfig } from "@/lib/app-config";

export const authClient = createAuthClient({
  baseURL: appConfig.authApiUrl,
  plugins: [
    expoClient({
      scheme: appConfig.appScheme,
      storagePrefix: "better-auth-dashboard",
      storage: SecureStore,
    }),
  ],
});
