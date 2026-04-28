import { Redirect, router } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic, warningHaptic } from "@/shared/lib/haptics";
import { buildAuthFetchOptions, type AppLocale, useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import type { ThemeMode } from "@/shared/lib/theme-tokens";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type MenuRowProps = {
  detail?: string;
  icon?: ImageSourcePropType;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
};

function MenuRow({ detail, icon, label, onPress, tone = "default" }: MenuRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      className="flex-row items-center border-b px-1 py-4"
      onPress={onPress}
      style={{
        borderColor: theme.border,
      }}
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center"
      >
        {icon ? (
          <Image
            className="h-5 w-5"
            resizeMode="contain"
            source={icon}
            style={{ tintColor: tone === "danger" ? theme.danger : theme.text }}
          />
        ) : (
          <View className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.text }} />
        )}
      </View>

      <View className="flex-1">
        <Text
          className="text-[16px] font-medium"
          style={{ color: tone === "danger" ? theme.danger : theme.text }}
        >
          {label}
        </Text>
      </View>

      {detail ? <Text className="mr-3 text-xs" style={{ color: theme.mutedText }}>{detail}</Text> : null}
      <Text className="text-2xl" style={{ color: theme.mutedText }}>{">"}</Text>
    </Pressable>
  );
}

function SectionLabel({ label }: { label: string }) {
  const { theme } = useAppTheme();

  return (
    <Text
      className="mb-4 mt-8 px-1 text-xs font-medium uppercase tracking-[1.5px]"
      style={{ color: theme.mutedText }}
    >
      {label}
    </Text>
  );
}

type ThemeModeSelectorProps = {
  icons: Record<"dark" | "light" | "system", ImageSourcePropType>;
  onSelect: (mode: ThemeMode) => void;
  selectedMode: ThemeMode;
  title: string;
};

type OptionSelectorFrameProps = {
  children: ReactNode;
  title: string;
};

function OptionSelectorFrame({ children, title }: OptionSelectorFrameProps) {
  const { theme } = useAppTheme();

  return (
    <View
      className="mb-5 px-1 py-2"
    >
      <Text className="mb-3 text-[16px] font-medium" style={{ color: theme.text }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function ThemeModeSelector({ icons, onSelect, selectedMode, title }: ThemeModeSelectorProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const options: Array<{ label: string; mode: ThemeMode }> = [
    { label: t("dashboard.themeLight"), mode: "light" },
    { label: t("dashboard.themeDark"), mode: "dark" },
    { label: t("dashboard.themeSystem"), mode: "system" },
  ];

  return (
    <OptionSelectorFrame title={title}>
      <View className="flex-row gap-3">
        {options.map((option) => {
          const isSelected = selectedMode === option.mode;

          return (
            <Pressable
              accessibilityLabel={`Set ${option.label} theme`}
              accessibilityRole="button"
              className="flex-1 items-center rounded-[18px] px-3 py-3"
              key={option.mode}
              onPress={() => {
                selectionHaptic();
                onSelect(option.mode);
              }}
              style={{
                backgroundColor: isSelected ? theme.primarySoft : theme.backgroundMuted,
              }}
            >
              <Image
                className="h-6 w-6"
                resizeMode="contain"
                source={icons[option.mode]}
                style={{ tintColor: isSelected ? theme.primary : theme.text }}
              />
              <Text
                className="mt-2 text-xs font-semibold"
                numberOfLines={1}
                style={{ color: isSelected ? theme.primary : theme.mutedText }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OptionSelectorFrame>
  );
}

type LanguageSelectorProps = {
  icons: Record<AppLocale, ImageSourcePropType>;
  onSelect: (locale: AppLocale) => void;
  selectedLocale: AppLocale;
  title: string;
};

function LanguageSelector({ icons, onSelect, selectedLocale, title }: LanguageSelectorProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const options: Array<{ label: string; locale: AppLocale }> = [
    { label: t("dashboard.languageSpanish"), locale: "es" },
    { label: t("dashboard.languageEnglish"), locale: "en" },
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
              className="flex-1 items-center rounded-[18px] px-3 py-3"
              key={option.locale}
              onPress={() => {
                selectionHaptic();
                onSelect(option.locale);
              }}
              style={{
                backgroundColor: isSelected ? theme.primarySoft : theme.backgroundMuted,
              }}
            >
              <Image
                className="h-7 w-7 rounded-full"
                resizeMode="cover"
                source={icons[option.locale]}
              />
              <Text
                className="mt-2 text-xs font-semibold"
                numberOfLines={1}
                style={{ color: isSelected ? theme.primary : theme.mutedText }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OptionSelectorFrame>
  );
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "BA";
}

export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { locale, setLocale } = useLanguage();
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const { t } = useTranslation();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = role
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");
  const sectionEntering = (index: number) =>
    FadeInDown.duration(480)
      .delay(index * 130)
      .easing(Easing.out(Easing.quad));

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const firstName = session.user.name.split(" ")[0] || session.user.name;
  const dashboardIcons = {
    admin: require("../../assets/administrator.png"),
    dark: require("../../assets/moon.png"),
    en: require("../../assets/england.png"),
    es: require("../../assets/spain.png"),
    light: require("../../assets/sun.png"),
    notifications: require("../../assets/notifications_blanco.png"),
    password: require("../../assets/padlock_blanco.png"),
    system: require("../../assets/phone.png"),
    twoFactor: require("../../assets/2fa_blanco.png"),
    out: require("../../assets/logout.png"),
    language: require("../../assets/language.png"),
  } satisfies Record<string, ImageSourcePropType>;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >

        <Animated.View entering={sectionEntering(0)}>
          <SectionLabel label={t("dashboard.profileSection")} />
          <View
            className="flex-row items-center px-1 py-3"
            style={{
              borderColor: theme.border,
            }}
          >
            <View
              className="mr-4 h-20 w-20 items-center justify-center rounded-[28px] border"
              style={{
                backgroundColor: theme.primarySoft,
                borderColor: theme.border,
              }}
            >
              <Text className="text-[22px] font-bold" style={{ color: theme.text }}>{getInitials(session.user.name)}</Text>
            </View>

            <View className="flex-1 gap-1">
              <Text className="text-[22px] font-bold" style={{ color: theme.text }}>{firstName}</Text>
              <Text className="text-sm" numberOfLines={1} style={{ color: theme.mutedText }}>{session.user.email}</Text>
              <Text className="mt-1 text-[11px] uppercase tracking-[1.3px]" style={{ color: theme.mutedText }}>{role}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={sectionEntering(1)}>
          <SectionLabel label={t("dashboard.authenticationSection")} />
          <MenuRow
            icon={dashboardIcons.password}
            label={t("dashboard.changePasswordOption")}
            onPress={() => {
              selectionHaptic();
              router.navigate("/change-password" as never);
            }}
          />
          <MenuRow
            icon={dashboardIcons.twoFactor}
            label={t("dashboard.twoFactorOption")}
            onPress={() => {
              selectionHaptic();
              router.navigate("/two-factor" as never);
            }}
          />
        </Animated.View>

        <Animated.View entering={sectionEntering(2)}>
          <SectionLabel label={t("dashboard.appSection")} />
          <LanguageSelector
            icons={{
              en: dashboardIcons.en,
              es: dashboardIcons.es,
            }}
            onSelect={(nextLocale) => {
              void setLocale(nextLocale);
            }}
            selectedLocale={locale}
            title={t("dashboard.languageOption")}
          />
          <ThemeModeSelector
            icons={{
              dark: dashboardIcons.dark,
              light: dashboardIcons.light,
              system: dashboardIcons.system,
            }}
            onSelect={(mode) => {
              void setThemeMode(mode);
            }}
            selectedMode={themeMode}
            title={t("dashboard.themeOption")}
          />
        </Animated.View>

        {isAdmin ? (
          <Animated.View entering={sectionEntering(3)}>
            <SectionLabel label={t("dashboard.adminSection")} />
            <MenuRow
              icon={dashboardIcons.admin}
              label={t("dashboard.adminPanelOption")}
              onPress={() => {
                selectionHaptic();
                router.navigate("/admin" as never);
              }}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={sectionEntering(4)}>
          <SectionLabel label={t("dashboard.sessionSection")} />
          <MenuRow
            icon={dashboardIcons.out}
            label={t("dashboard.signOut")}
            onPress={() => {
              warningHaptic();
              void authClient.signOut({
                ...buildAuthFetchOptions(locale),
                fetchOptions: {
                  headers: buildAuthFetchOptions(locale).fetchOptions.headers,
                  onSuccess: () => {
                    router.replace("/sign-in");
                  },
                },
              });
            }}
            tone="danger"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
