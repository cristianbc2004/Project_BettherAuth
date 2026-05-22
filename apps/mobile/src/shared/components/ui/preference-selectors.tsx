import { useEffect, useRef, useState, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AppText } from "@/shared/components/ui/app-text";
import { selectionHaptic } from "@/shared/lib/haptics";
import type { AppLocale } from "@/shared/lib/locale";
import type { AppTheme, ThemeMode } from "@/shared/lib/theme-tokens";

function scheduleSelectionHaptic() {
  requestAnimationFrame(() => {
    selectionHaptic();
  });
}

type OptionSelectorFrameProps = {
  children: ReactNode;
  title: string;
};

function OptionSelectorFrame({ children, title }: OptionSelectorFrameProps) {
  return (
    <View className="mt-7 px-1">
      <AppText className="mb-4 text-[22px] font-bold leading-[28px]">
        {title}
      </AppText>
      {children}
    </View>
  );
}

type ThemeModeSelectorProps = {
  icons: Record<"dark" | "light" | "system", LucideIcon>;
  onSelect: (mode: ThemeMode) => void;
  selectedMode: ThemeMode;
  theme: AppTheme;
  title: string;
};

export function ThemeModeSelector({ icons, onSelect, selectedMode, theme, title }: ThemeModeSelectorProps) {
  const { t } = useTranslation();
  const [optimisticMode, setOptimisticMode] = useState(selectedMode);
  const pendingModeRef = useRef<ThemeMode | null>(null);
  const pendingFrameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const options: Array<{ label: string; mode: ThemeMode }> = [
    { label: t("dashboard.themeLight"), mode: "light" },
    { label: t("dashboard.themeDark"), mode: "dark" },
    { label: t("dashboard.themeSystem"), mode: "system" },
  ];

  useEffect(() => {
    if (pendingModeRef.current === selectedMode) {
      pendingModeRef.current = null;
    }

    if (pendingModeRef.current === null) {
      setOptimisticMode(selectedMode);
    }
  }, [selectedMode]);

  useEffect(() => {
    return () => {
      if (pendingFrameRef.current !== null) {
        cancelAnimationFrame(pendingFrameRef.current);
      }
    };
  }, []);

  function scheduleThemeModeSelection(mode: ThemeMode) {
    if (pendingFrameRef.current !== null) {
      cancelAnimationFrame(pendingFrameRef.current);
    }

    pendingFrameRef.current = requestAnimationFrame(() => {
      pendingFrameRef.current = null;
      onSelect(mode);
    });
  }

  return (
    <OptionSelectorFrame title={title}>
      <View className="flex-row gap-2">
        {options.map((option) => {
          const isSelected = optimisticMode === option.mode;
          const OptionIcon = icons[option.mode];

          return (
            <Pressable
              accessibilityLabel={`Set ${option.label} theme`}
              accessibilityRole="button"
              className="h-14 flex-1 flex-row items-center justify-center rounded-[16px] border px-2"
              key={option.mode}
              onPress={() => {
                pendingModeRef.current = option.mode;
                setOptimisticMode(option.mode);
                scheduleThemeModeSelection(option.mode);
                scheduleSelectionHaptic();
              }}
              style={{
                backgroundColor: isSelected ? theme.primarySoft : theme.background,
                borderColor: isSelected ? theme.primary : theme.border,
              }}
            >
              <OptionIcon color={isSelected ? theme.primary : theme.text} size={22} strokeWidth={2.2} />
              <AppText
                className="ml-1.5 min-w-0 shrink text-[13px] font-semibold leading-5"
                numberOfLines={1}
                tone={isSelected ? "primary" : "default"}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </OptionSelectorFrame>
  );
}

type LanguageSelectorProps = {
  onSelect: (locale: AppLocale) => void;
  selectedLocale: AppLocale;
  theme: AppTheme;
  title: string;
};

export function LanguageSelector({ onSelect, selectedLocale, theme, title }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const options: Array<{ code: string; label: string; locale: AppLocale }> = [
    { code: "ES", label: t("dashboard.languageSpanish"), locale: "es" },
    { code: "EN", label: t("dashboard.languageEnglish"), locale: "en" },
  ];

  return (
    <OptionSelectorFrame title={title}>
      <View className="flex-row gap-3">
        {options.map((option) => {
          const isSelected = selectedLocale === option.locale;

          return (
            <Pressable
              accessibilityLabel={`Set ${option.label} language`}
              accessibilityRole="button"
              className="h-14 flex-1 flex-row items-center justify-center rounded-[16px] border px-3"
              key={option.locale}
              onPress={() => {
                selectionHaptic();
                onSelect(option.locale);
              }}
              style={{
                backgroundColor: isSelected ? theme.primarySoft : theme.background,
                borderColor: isSelected ? theme.primary : theme.border,
              }}
            >
              <View
                className="mr-2 h-8 w-9 items-center justify-center rounded-[10px]"
                style={{ backgroundColor: isSelected ? theme.primarySoft : theme.backgroundMuted }}
              >
                <AppText className="text-[12px] font-bold" tone={isSelected ? "primary" : "default"}>
                  {option.code}
                </AppText>
              </View>
              <AppText
                className="min-w-0 shrink text-sm font-semibold leading-5"
                numberOfLines={1}
                tone={isSelected ? "primary" : "default"}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </OptionSelectorFrame>
  );
}
