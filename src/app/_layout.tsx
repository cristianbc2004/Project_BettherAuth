import "../../global.css";
import "@/shared/lib/i18n";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LanguageToggle } from "@/shared/components/ui/language-toggle";
import { LanguageProvider } from "@/shared/lib/locale";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      <LanguageToggle />
    </LanguageProvider>
  );
}
