export const themes = {
  light: {
    background: "#f7f8fc",
    backgroundElevated: "#ffffff",
    backgroundMuted: "#eef1f7",
    border: "rgba(20, 31, 51, 0.22)",
    card: "#ffffff",
    danger: "#dc2626",
    inputBackground: "rgba(20, 31, 51, 0.05)",
    inputBorder: "rgba(20, 31, 51, 0.12)",
    mutedText: "rgba(20, 31, 51, 0.64)",
    overlay: "rgba(141, 61, 255, 0.08)",
    primary: "#7c35e8",
    primarySoft: "rgba(124, 53, 232, 0.12)",
    success: "#059669",
    text: "#141f33",
    textOnPrimary: "#ffffff",
  },
  dark: {
    background: "#060c17",
    backgroundElevated: "#0b1220",
    backgroundMuted: "#111a2b",
    border: "rgba(255, 255, 255, 0.18)",
    card: "#0b1220",
    danger: "#f87171",
    inputBackground: "rgba(255, 255, 255, 0.06)",
    inputBorder: "rgba(255, 255, 255, 0.08)",
    mutedText: "rgba(255, 255, 255, 0.65)",
    overlay: "rgba(106, 52, 211, 0.18)",
    primary: "#ab8ae6",
    primarySoft: "rgba(141, 61, 255, 0.16)",
    success: "#34d399",
    text: "#ffffff",
    textOnPrimary: "#ffffff",
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeMode = ThemeName | "system";
export type AppTheme = (typeof themes)[ThemeName];
