import "../../global.css";
import "@/shared/lib/i18n";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { WalletCardsProvider } from "@/features/finance/lib/wallet-cards-context";
import { LanguageProvider } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";

function AppNavigation() {
  const { resolvedThemeName, theme } = useAppTheme();

  return (
    <LanguageProvider>
      <StatusBar style={resolvedThemeName === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="targets/add" />
        <Stack.Screen name="home-graphic" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="notification" />
        <Stack.Screen name="bizum" />
        <Stack.Screen name="person" />
        <Stack.Screen name="legal/cookies" />
        <Stack.Screen name="legal/privacy" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(auth)/verify-email" />
        <Stack.Screen name="(auth)/two-factor" />
        <Stack.Screen name="(auth)/two-factor-verify" />
        <Stack.Screen name="(auth)/change-password" />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/create-user" />
        <Stack.Screen name="admin/list-users" />
        <Stack.Screen name="admin/delete-user" />
      </Stack>
    </LanguageProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <WalletCardsProvider>
          <AppNavigation />
        </WalletCardsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
