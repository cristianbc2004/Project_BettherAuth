import "../../global.css";
import "@/shared/lib/i18n";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LanguageToggle } from "@/shared/components/ui/language-toggle";
import { LanguageProvider } from "@/shared/lib/locale";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#060c17",
    card: "#060c17",
    border: "rgba(255,255,255,0.08)",
    primary: "#ab8ae6",
    text: "#ffffff",
  },
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
            contentStyle: { backgroundColor: "#060c17" },
          }}
        >
          <Stack.Screen name="index" options={{ animation: "none" }} />
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
        <LanguageToggle />
      </ThemeProvider>
    </LanguageProvider>
  );
}
