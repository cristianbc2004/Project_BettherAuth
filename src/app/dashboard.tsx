import { Redirect, router } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic, warningHaptic } from "@/shared/lib/haptics";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type MenuRowProps = {
  accent?: string;
  detail?: string;
  icon?: ImageSourcePropType;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
};

function MenuRow({ accent = "#2d3750", detail, icon, label, onPress, tone = "default" }: MenuRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      className="mb-4 flex-row items-center rounded-[24px] border px-4 py-4"
      onPress={onPress}
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center"
        style={icon ? undefined : { backgroundColor: accent }}
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
      className="mb-3 mt-2 px-1 text-xs font-medium uppercase tracking-[1.5px]"
      style={{ color: theme.mutedText }}
    >
      {label}
    </Text>
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
  const { theme, themeMode, toggleThemeMode } = useAppTheme();
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
  const themeModeLabel = {
    dark: "Dark",
    light: "Light",
    system: "System",
  }[themeMode];
  const dashboardIcons = {
    admin: require("../../assets/administrator.png"),
    notifications: require("../../assets/notifications_blanco.png"),
    password: require("../../assets/padlock_blanco.png"),
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
        <View className="mb-8 flex-row items-center justify-between">
          <AppBackButton fallbackHref={"/home" as never} />
          <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>Profile</Text>
          <Pressable
            className="h-11 w-11 items-center justify-center"
            onPress={() => {
              selectionHaptic();
              router.push("/notifications" as never);
            }}
          >
            <Image
              className="h-5 w-5"
              resizeMode="contain"
              source={dashboardIcons.notifications}
              style={{ tintColor: theme.text }}
            />
          </Pressable>
        </View>

        <Animated.View entering={sectionEntering(0)}>
          <SectionLabel label="Profile" />
          <Pressable
            className="flex-row items-center rounded-[26px] border px-4 py-4"
            onPress={() => {
              selectionHaptic();
              router.push("/change-password" as never);
            }}
            style={{
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            }}
          >
            <View className="mr-4 h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: theme.primary }}>
              <Text className="text-lg font-bold" style={{ color: theme.textOnPrimary }}>{getInitials(session.user.name)}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-[16px] font-semibold" style={{ color: theme.text }}>{firstName}</Text>
              <Text className="mt-1 text-sm" style={{ color: theme.mutedText }}>{session.user.email}</Text>
              <Text className="mt-2 text-[11px] uppercase tracking-[1.3px]" style={{ color: theme.mutedText }}>{role}</Text>
            </View>

            <Text className="text-2xl" style={{ color: theme.mutedText }}>{">"}</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={sectionEntering(1)}>
          <SectionLabel label="Authentication" />
          <MenuRow
            accent="#2a3144"
            icon={dashboardIcons.password}
            label="Change password"
            onPress={() => {
              selectionHaptic();
              router.push("/change-password" as never);
            }}
          />
          <MenuRow
            accent="#313a4f"
            icon={dashboardIcons.twoFactor}
            label="Two-factor authentication"
            onPress={() => {
              selectionHaptic();
              router.push("/two-factor" as never);
            }}
          />
        </Animated.View>

        <Animated.View entering={sectionEntering(2)}>
          <SectionLabel label="App" />
          <MenuRow
            accent="#43325d"
            icon={dashboardIcons.notifications}
            label="Notifications"
            onPress={() => {
              selectionHaptic();
              router.push("/notifications" as never);
            }}
          />
          <MenuRow
            accent="#313748"
            detail={locale === "es" ? "Spanish" : "English"}
            icon={dashboardIcons.language}
            label="App language"
            onPress={() => {
              selectionHaptic();
              void setLocale(locale === "es" ? "en" : "es");
            }}
          />
          <MenuRow
            accent="#49366d"
            detail={themeModeLabel}
            label="Theme"
            onPress={() => {
              selectionHaptic();
              void toggleThemeMode();
            }}
          />
        </Animated.View>

        {isAdmin ? (
          <Animated.View entering={sectionEntering(3)}>
            <SectionLabel label="Admin" />
            <MenuRow
              accent="#41385c"
              icon={dashboardIcons.admin}
              label="Admin panel"
              onPress={() => {
                selectionHaptic();
                router.push("/admin" as never);
              }}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={sectionEntering(4)}>
          <SectionLabel label="Session" />
          <MenuRow
            accent="#232937"
            icon={dashboardIcons.out}
            label="Log out"
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
