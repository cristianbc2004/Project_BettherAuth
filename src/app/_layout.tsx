import "../../global.css";
import "@/lib/i18n";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider } from "@/lib/locale";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      <LanguageToggle />
    </LanguageProvider>
  );
}
