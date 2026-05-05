import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Appearance } from "react-native";

import { type AppTheme, type ThemeMode, type ThemeName, themes } from "@/shared/lib/theme-tokens";

const THEME_STORAGE_KEY = "@better_auth_dashboard_theme";
const themeModes: ThemeMode[] = ["system", "light", "dark"];
type ScheduledFrame = ReturnType<typeof setTimeout> | number;

type AppThemeContextValue = {
  resolvedThemeName: ThemeName;
  setThemeMode: (mode: ThemeMode) => void;
  theme: AppTheme;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

type SystemColorScheme = "dark" | "light" | "unspecified" | null | undefined;

function resolveSystemTheme(colorScheme: SystemColorScheme): ThemeName {
  return colorScheme === "dark" ? "dark" : "light";
}

function scheduleThemeFrame(callback: () => void): ScheduledFrame {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(() => {
      callback();
    });
  }

  return setTimeout(callback, 0);
}

function cancelThemeFrame(frame: ScheduledFrame) {
  if (typeof cancelAnimationFrame === "function" && typeof frame === "number") {
    cancelAnimationFrame(frame);
    return;
  }

  clearTimeout(frame);
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [systemThemeName, setSystemThemeName] = useState<ThemeName>(() =>
    resolveSystemTheme(Appearance.getColorScheme()),
  );

  // "system" is a preference, but the app still needs a concrete palette to render.
  const resolvedThemeName: ThemeName = themeMode === "system" ? systemThemeName : themeMode;
  const theme = themes[resolvedThemeName];

  useEffect(() => {
    // Load the user's saved preference once when the provider mounts.
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (isThemeMode(savedTheme)) {
          setThemeModeState(savedTheme);
          return;
        }

        setThemeModeState("system");
      } catch {
        setThemeModeState("system");
      }
    };

    void loadSavedTheme();
  }, []);

  useEffect(() => {
    const syncSystemTheme = (colorScheme: SystemColorScheme) => {
      setSystemThemeName(resolveSystemTheme(colorScheme));
    };

    const appearanceSubscription = Appearance.addChangeListener((state) => {
      syncSystemTheme(state.colorScheme);
    });
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        syncSystemTheme(Appearance.getColorScheme());
      }
    });

    return () => {
      appearanceSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  const persistThemeMode = useCallback((mode: ThemeMode) => {
    void AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {
      // Persistence failure should not block the in-memory theme update.
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState((currentMode) => (currentMode === mode ? currentMode : mode));
    persistThemeMode(mode);
  }, [persistThemeMode]);

  const toggleThemeMode = useCallback(() => {
    // Cycle through the supported modes from the single floating theme control.
    setThemeModeState((currentMode) => {
      const currentIndex = themeModes.indexOf(currentMode);
      const nextMode = themeModes[(currentIndex + 1) % themeModes.length];

      persistThemeMode(nextMode);
      return nextMode;
    });
  }, [persistThemeMode]);

  const value = useMemo(
    () => ({
      resolvedThemeName,
      setThemeMode,
      theme,
      themeMode,
      toggleThemeMode,
    }),
    [resolvedThemeName, setThemeMode, theme, themeMode, toggleThemeMode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}

export function useDeferredAppTheme() {
  const context = useAppTheme();
  const [deferredContext, setDeferredContext] = useState(context);

  useEffect(() => {
    const frame = scheduleThemeFrame(() => {
      setDeferredContext(context);
    });

    return () => {
      cancelThemeFrame(frame);
    };
  }, [context]);

  return deferredContext;
}
