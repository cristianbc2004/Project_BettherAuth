import { Pressable, Text, View } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const { theme } = useAppTheme();

  return (
    <View
      className="absolute right-5 top-14 z-50 flex-row rounded-full border p-1"
      style={{
        backgroundColor: theme.backgroundElevated,
        borderColor: theme.border,
      }}
    >
      <Pressable
        className="rounded-full px-3 py-2"
        onPress={() => {
          if (locale !== "es") {
            selectionHaptic();
          }
          void setLocale("es");
        }}
        style={{ backgroundColor: locale === "es" ? theme.primary : "transparent" }}
      >
        <Text
          className="text-xs font-bold uppercase"
          style={{ color: locale === "es" ? theme.textOnPrimary : theme.text }}
        >
          ES
        </Text>
      </Pressable>

      <Pressable
        className="rounded-full px-3 py-2"
        onPress={() => {
          if (locale !== "en") {
            selectionHaptic();
          }
          void setLocale("en");
        }}
        style={{ backgroundColor: locale === "en" ? theme.primary : "transparent" }}
      >
        <Text
          className="text-xs font-bold uppercase"
          style={{ color: locale === "en" ? theme.textOnPrimary : theme.text }}
        >
          EN
        </Text>
      </Pressable>
    </View>
  );
}
