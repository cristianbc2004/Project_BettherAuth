import * as SecureStore from "expo-secure-store";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export const themePreferences = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "better-auth-dashboard-theme";

const palette = {
  dark: {
    background: "#080c18",
    card: "#0b1220",
    cardMuted: "rgba(255, 255, 255, 0.04)",
    border: "rgba(255, 255, 255, 0.08)",
    mutedText: "rgba(255, 255, 255, 0.65)",
    primary: "#8d3dff",
    text: "#ffffff",
  },
  light: {
    background: "#f6f2ff",
    card: "#ffffff",
    cardMuted: "rgba(91, 63, 142, 0.08)",
    border: "rgba(91, 63, 142, 0.14)",
    mutedText: "rgba(31, 25, 43, 0.62)",
    primary: "#7a35e8",
    text: "#1f192b",
  },
} as const;

type AppTheme = (typeof palette)[ResolvedTheme];

type ThemeContextValue = {
  colorScheme: ResolvedTheme;
  isReady: boolean;
  preference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);
  const resolvedSystemColorScheme: ResolvedTheme = systemColorScheme === "light" ? "light" : "dark";
  const colorScheme: ResolvedTheme =
    preference === "system" ? resolvedSystemColorScheme : preference;
  const theme = palette[colorScheme];

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      try {
        const storedPreference = await SecureStore.getItemAsync(THEME_STORAGE_KEY);

        if (isMounted && storedPreference && isThemePreference(storedPreference)) {
          setPreference(storedPreference);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  const setThemePreference = async (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, nextPreference);
  };

  const value = useMemo(
    () => ({
      colorScheme,
      isReady,
      preference,
      setThemePreference,
      theme,
    }),
    [colorScheme, isReady, preference, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider.");
  }

  return context;
}
