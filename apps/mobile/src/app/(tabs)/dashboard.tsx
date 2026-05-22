import { Redirect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Lock,
  LogOut,
  type LucideIcon,
  Moon,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { AppText } from "@/shared/components/ui/app-text";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { LanguageSelector, ThemeModeSelector } from "@/shared/components/ui/preference-selectors";
import { useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { selectionHaptic, warningHaptic } from "@/shared/lib/haptics";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import type { AppTheme } from "@/shared/lib/theme-tokens";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type MenuRowProps = {
  detail?: string;
  icon?: LucideIcon;
  label: string;
  onPress: () => void;
  theme: AppTheme;
  tone?: "default" | "danger";
};

function MenuRow({ detail, icon, label, onPress, theme, tone = "default" }: MenuRowProps) {
  const iconColor = tone === "danger" ? theme.danger : theme.text;
  const RowIcon = icon;

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
        {RowIcon ? (
          <RowIcon color={iconColor} size={20} strokeWidth={2.2} />
        ) : (
          <View className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.text }} />
        )}
      </View>

      <View className="flex-1">
      <AppText
        className="text-[16px] font-medium"
        tone={tone === "danger" ? "danger" : "default"}
      >
        {label}
      </AppText>
      </View>

      {detail ? <AppText className="mr-3 text-xs" tone="muted">{detail}</AppText> : null}
      <ChevronRight color={theme.mutedText} size={22} strokeWidth={2.2} />
    </Pressable>
  );
}

function SectionLabel({ label, theme }: { label: string; theme: AppTheme }) {
  return (
    <AppText
      className="mb-4 mt-7 px-1 text-[22px] font-bold leading-[28px]"
    >
      {label}
    </AppText>
  );
}


export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { locale, setLocale } = useLanguage();
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const { contentBottomSpacing } = useFloatingTabBarMetrics();
  const { t } = useTranslation();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = role
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const firstName = session.user.name.split(" ")[0] || session.user.name;
  const dashboardIcons = {
    admin: Shield,
    dark: Moon,
    light: Sun,
    out: LogOut,
    password: Lock,
    system: Smartphone,
    twoFactor: ShieldCheck,
    user: UserRound,
  } satisfies Record<string, LucideIcon>;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>

      <View className="flex-1 px-5 pt-4">
        <AppScreenHeader title="Perfil" />
        <ScrollView
          className="flex-1"
          bounces={false}
          contentContainerStyle={{ paddingBottom: contentBottomSpacing }}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-5 flex-row gap-3">
            <View
              className="flex-1 rounded-[16px] border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.backgroundElevated,
              }}
            >
              <AppText className="tracking-[1.5px]" variant="eyebrow">
                {t("dashboard.userCardTitle")}
              </AppText>
              <AppText className="mt-3 text-[16px] font-bold" numberOfLines={1}>
                {firstName}
              </AppText>
              <AppText className="mt-1 text-sm" numberOfLines={1} tone="muted">
                {session.user.email}
              </AppText>
            </View>

            <View
              className="flex-1 rounded-[16px] border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.backgroundElevated,
              }}
            >
              <AppText className="tracking-[1.5px]" variant="eyebrow">
                {t("dashboard.roleCardTitle")}
              </AppText>
              <AppText className="mt-3 text-[16px] font-bold uppercase" numberOfLines={1}>
                {role}
              </AppText>
              <AppText className="mt-1 text-sm" numberOfLines={1} tone="muted">
                {isAdmin ? t("dashboard.adminPanelOption") : t("dashboard.profileSection")}
              </AppText>
            </View>
          </View>

          <View className="mt-4 flex-row items-center px-1 py-2">
            <dashboardIcons.user color={theme.text} size={22} strokeWidth={2.1} />
            <AppText className="ml-4 text-[16px] font-semibold">
              {t("dashboard.accountStatus")}
            </AppText>
            <View
              className="ml-4 rounded-full border px-3 py-1"
              style={{ backgroundColor: `${theme.success}18`, borderColor: theme.success }}
            >
              <AppText className="text-sm font-bold" tone="success">
                {t("common.active")}
              </AppText>
            </View>
          </View>

          <View>
            <SectionLabel label={t("dashboard.authenticationSection")} theme={theme} />
            <MenuRow
              icon={dashboardIcons.password}
              label={t("dashboard.changePasswordOption")}
              onPress={() => {
                selectionHaptic();
                router.navigate("/change-password" as never);
              }}
              theme={theme}
            />
            <MenuRow
              icon={dashboardIcons.twoFactor}
              label={t("dashboard.twoFactorOption")}
              onPress={() => {
                selectionHaptic();
                router.navigate("/two-factor" as never);
              }}
              theme={theme}
            />
          </View>

          <View>
            <LanguageSelector
              onSelect={(nextLocale) => {
                void setLocale(nextLocale);
              }}
              selectedLocale={locale}
              theme={theme}
              title={t("dashboard.languageRegionSection")}
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
              theme={theme}
              title={t("dashboard.appearanceSection")}
            />
          </View>

          {isAdmin ? (
            <View>
              <SectionLabel label={t("dashboard.adminSection")} theme={theme} />
              <MenuRow
                icon={dashboardIcons.admin}
                label={t("dashboard.adminPanelOption")}
                onPress={() => {
                  selectionHaptic();
                  router.navigate("/admin" as never);
                }}
                theme={theme}
              />
            </View>
          ) : null}

          <View>
            <SectionLabel label={t("dashboard.sessionSection")} theme={theme} />
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
              theme={theme}
              tone="danger"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
