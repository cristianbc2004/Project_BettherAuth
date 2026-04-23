import { Pressable, Text, View } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { type ThemePreference, themePreferences, useAppTheme } from "@/shared/lib/theme";

const labels: Record<ThemePreference, string> = {
  dark: "OS",
  light: "CL",
  system: "AU",
};

export function ThemeToggle() {
  const { preference, setThemePreference, theme } = useAppTheme();

  return (
    <View
      className="absolute left-5 top-14 z-50 flex-row rounded-full p-1"
      style={{
        backgroundColor: theme.cardMuted,
        borderColor: theme.border,
        borderWidth: 1,
      }}
    >
      {themePreferences.map((option) => {
        const isSelected = preference === option;

        return (
          <Pressable
            className="rounded-full px-3 py-2"
            key={option}
            onPress={() => {
              if (!isSelected) {
                selectionHaptic();
                void setThemePreference(option);
              }
            }}
            style={{
              backgroundColor: isSelected ? theme.primary : "transparent",
            }}
          >
            <Text
              className="text-xs font-bold uppercase"
              style={{ color: isSelected ? "#ffffff" : theme.text }}
            >
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
