import "../../global.css";
import "@/shared/lib/i18n";

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";

import { LanguageToggle } from "@/shared/components/ui/language-toggle";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { LanguageProvider } from "@/shared/lib/locale";
import { AppThemeProvider, useAppTheme } from "@/shared/lib/theme";

function AppNavigator() {
  const { colorScheme, theme } = useAppTheme();
  const navigationTheme = useMemo(
    () => ({
      ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
      colors: {
        ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
        background: theme.background,
        card: theme.background,
        border: theme.border,
        primary: theme.primary,
        text: theme.text,
      },
    }),
    [colorScheme, theme],
  );

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          contentStyle: { backgroundColor: theme.background },
        }}
      />
      <ThemeToggle />
      <LanguageToggle />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AppThemeProvider>
        <AppNavigator />
      </AppThemeProvider>
    </LanguageProvider>
  );
}
