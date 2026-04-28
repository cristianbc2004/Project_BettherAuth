import "../../global.css";
import "@/shared/lib/i18n";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LanguageProvider } from "@/shared/lib/locale";
import { AppThemeProvider, useAppTheme } from "@/shared/lib/theme-context";

function AppNavigation() {
  const { resolvedThemeName, theme } = useAppTheme();
  const baseNavigationTheme = resolvedThemeName === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: theme.background,
      card: theme.card,
      border: theme.border,
      primary: theme.primary,
      text: theme.text,
    },
  };

  return (
    <LanguageProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={resolvedThemeName === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="index" options={{ animation: "none" }} />
          <Stack.Screen name="home" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="notifications" />
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
      <AppNavigation />
    </AppThemeProvider>
  );
}
