import { Pressable, Text, View } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

const modeLabels = {
  dark: "Dark",
  light: "Light",
  system: "System",
} as const;

export function ThemeToggle() {
  const { theme, themeMode, toggleThemeMode } = useAppTheme();

  return (
    <View
      className="absolute left-5 top-14 z-50 rounded-full border p-1"
      style={{
        backgroundColor: theme.backgroundElevated,
        borderColor: theme.border,
      }}
    >
      <Pressable
        accessibilityLabel={`Theme mode: ${modeLabels[themeMode]}. Change theme mode.`}
        accessibilityRole="button"
        className="rounded-full px-3 py-2"
        hitSlop={8}
        onPress={() => {
          selectionHaptic();
          void toggleThemeMode();
        }}
        style={{ backgroundColor: theme.primarySoft }}
      >
        <Text
          className="text-xs font-bold uppercase"
          style={{ color: theme.text }}
        >
          {modeLabels[themeMode]}
        </Text>
      </Pressable>
    </View>
  );
}
