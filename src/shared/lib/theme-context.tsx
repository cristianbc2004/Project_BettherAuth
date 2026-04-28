import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { type AppTheme, type ThemeMode, type ThemeName, themes } from "@/shared/lib/theme-tokens";

const THEME_STORAGE_KEY = "@better_auth_dashboard_theme";
const themeModes: ThemeMode[] = ["system", "light", "dark"];

type AppThemeContextValue = {
  resolvedThemeName: ThemeName;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  theme: AppTheme;
  themeMode: ThemeMode;
  toggleThemeMode: () => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  // "system" is a preference, but the app still needs a concrete palette to render.
  const resolvedThemeName: ThemeName =
    themeMode === "system" ? (systemColorScheme === "dark" ? "dark" : "light") : themeMode;
  const theme = themes[resolvedThemeName];

  useEffect(() => {
    // Load the user's saved preference once when the provider mounts.
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (isThemeMode(savedTheme)) {
          setThemeModeState(savedTheme);
        }
      } catch {
        setThemeModeState("system");
      }
    };

    void loadSavedTheme();
  }, []);

  useEffect(() => {
    // Keep NativeWind's dark: classes aligned with the selected app theme mode.
    setColorScheme(themeMode);
  }, [setColorScheme, themeMode]);

  const setThemeMode = async (mode: ThemeMode) => {
    // Update immediately for responsive UI, then persist for the next app launch.
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleThemeMode = async () => {
    // Cycle through the supported modes from the single floating theme control.
    const currentIndex = themeModes.indexOf(themeMode);
    const nextMode = themeModes[(currentIndex + 1) % themeModes.length];

    await setThemeMode(nextMode);
  };

  const value = useMemo(
    () => ({
      resolvedThemeName,
      setThemeMode,
      theme,
      themeMode,
      toggleThemeMode,
    }),
    [resolvedThemeName, theme, themeMode],
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
