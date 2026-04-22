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
            animation: "none",
            contentStyle: { backgroundColor: "#060c17" },
          }}
        />
        <LanguageToggle />
      </ThemeProvider>
    </LanguageProvider>
  );
}
