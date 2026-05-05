import {
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Appearance, useColorScheme } from "react-native";

import { type AppTheme, type ThemeMode, type ThemeName, themes } from "@/shared/lib/theme-tokens";

const themeModes: ThemeMode[] = ["system", "light", "dark"];
const subscribers = new Set<() => void>();
let themeModeSnapshot: ThemeMode = "system";

type SystemColorScheme = "dark" | "light" | "unspecified" | null | undefined;

function resolveSystemTheme(colorScheme: SystemColorScheme): ThemeName {
  return colorScheme === "dark" ? "dark" : "light";
}

function applyThemeMode(mode: ThemeMode) {
  // NativeWind v5 listens to Appearance changes directly.
  Appearance.setColorScheme(mode === "system" ? "unspecified" : mode);
}

function emitThemeModeChange() {
  subscribers.forEach((listener) => {
    listener();
  });
}

function subscribeThemeMode(listener: () => void) {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

function getThemeModeSnapshot() {
  return themeModeSnapshot;
}

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const themeMode = useSyncExternalStore(subscribeThemeMode, getThemeModeSnapshot, getThemeModeSnapshot);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    if (themeModeSnapshot === mode) {
      return;
    }

    themeModeSnapshot = mode;
    applyThemeMode(mode);
    emitThemeModeChange();
  }, []);

  const toggleThemeMode = useCallback(() => {
    const currentIndex = themeModes.indexOf(themeModeSnapshot);
    const nextMode = themeModes[(currentIndex + 1) % themeModes.length];
    themeModeSnapshot = nextMode;
    applyThemeMode(nextMode);
    emitThemeModeChange();
  }, []);

  const resolvedThemeName: ThemeName = themeMode === "system" ? resolveSystemTheme(colorScheme) : themeMode;
  const theme: AppTheme = themes[resolvedThemeName];

  return useMemo(
    () => ({
      resolvedThemeName,
      setThemeMode,
      theme,
      themeMode,
      toggleThemeMode,
    }),
    [resolvedThemeName, setThemeMode, theme, themeMode, toggleThemeMode],
  );
}
