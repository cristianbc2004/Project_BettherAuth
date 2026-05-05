import "../../global.css";
import "@/shared/lib/i18n";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";

import { WalletCardsProvider } from "@/features/finance/lib/wallet-cards-context";
import { LanguageProvider } from "@/shared/lib/locale";
import { AppThemeProvider, useDeferredAppTheme } from "@/shared/lib/theme-context";

function AppNavigation() {
  const { resolvedThemeName, theme } = useDeferredAppTheme();
  const baseNavigationTheme = resolvedThemeName === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = useMemo(
    () => ({
      ...baseNavigationTheme,
      colors: {
        ...baseNavigationTheme.colors,
        background: theme.background,
        card: theme.card,
        border: theme.border,
        primary: theme.primary,
        text: theme.text,
      },
    }),
    [baseNavigationTheme, theme.background, theme.border, theme.card, theme.primary, theme.text],
  );
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: "none" as const,
      contentStyle: { backgroundColor: theme.background },
    }),
    [theme.background],
  );

  return (
    <LanguageProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={resolvedThemeName === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={screenOptions}
        >
          <Stack.Screen name="index" options={{ animation: "none" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
          <Stack.Screen name="targets/add" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="person" />
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
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <WalletCardsProvider>
        <AppNavigation />
      </WalletCardsProvider>
    </AppThemeProvider>
  );
}
