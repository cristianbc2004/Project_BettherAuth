import { Pressable, Text, View } from "react-native";

import { useLanguage } from "@/lib/locale";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <View className="absolute right-5 top-14 z-50 flex-row rounded-full border border-white/60 bg-ink-900/85 p-1">
      <Pressable
        className={`rounded-full px-3 py-2 ${locale === "es" ? "bg-coral-400" : ""}`}
        onPress={() => {
          void setLocale("es");
        }}
      >
        <Text className={`text-xs font-bold uppercase ${locale === "es" ? "text-ink-900" : "text-sand"}`}>
          ES
        </Text>
      </Pressable>

      <Pressable
        className={`rounded-full px-3 py-2 ${locale === "en" ? "bg-coral-400" : ""}`}
        onPress={() => {
          void setLocale("en");
        }}
      >
        <Text className={`text-xs font-bold uppercase ${locale === "en" ? "text-ink-900" : "text-sand"}`}>
          EN
        </Text>
      </Pressable>
    </View>
  );
}
