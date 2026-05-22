import {
  createContext,
  type ReactNode,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Appearance, useColorScheme } from "react-native";

import { type AppTheme, type ThemeMode, type ThemeName, themes } from "@/shared/lib/theme-tokens";

const themeModes: ThemeMode[] = ["system", "light", "dark"];
const subscribers = new Set<() => void>();
let themeModeSnapshot: ThemeMode = "system";
let scheduledThemeMode: ThemeMode | null = null;
let themeModeFrame: ReturnType<typeof requestAnimationFrame> | null = null;

type SystemColorScheme = "dark" | "light" | "unspecified" | null | undefined;
type AppThemeContextValue = {
  resolvedThemeName: ThemeName;
  setThemeMode: (mode: ThemeMode) => void;
  theme: AppTheme;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function resolveSystemTheme(colorScheme: SystemColorScheme): ThemeName {
  return colorScheme === "dark" ? "dark" : "light";
}

function applyThemeMode(mode: ThemeMode) {
  Appearance.setColorScheme(mode === "system" ? "unspecified" : mode);
}

function scheduleApplyThemeMode(mode: ThemeMode) {
  scheduledThemeMode = mode;

  if (themeModeFrame !== null) {
    return;
  }

  themeModeFrame = requestAnimationFrame(() => {
    const nextMode = scheduledThemeMode;
    scheduledThemeMode = null;
    themeModeFrame = null;

    if (nextMode) {
      applyThemeMode(nextMode);
    }
  });
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

function updateThemeMode(mode: ThemeMode) {
  if (themeModeSnapshot === mode) {
    return;
  }

  themeModeSnapshot = mode;
  emitThemeModeChange();
  scheduleApplyThemeMode(mode);
}

function useAppThemeValue(): AppThemeContextValue {
  const colorScheme = useColorScheme();
  const themeMode = useSyncExternalStore(subscribeThemeMode, getThemeModeSnapshot, getThemeModeSnapshot);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    updateThemeMode(mode);
  }, []);

  const toggleThemeMode = useCallback(() => {
    const currentIndex = themeModes.indexOf(themeModeSnapshot);
    const nextMode = themeModes[(currentIndex + 1) % themeModes.length];
    updateThemeMode(nextMode);
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

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const value = useAppThemeValue();

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
