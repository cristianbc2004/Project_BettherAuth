import { Redirect, router } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic, warningHaptic } from "@/shared/lib/haptics";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";
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
  return (
    <Pressable
      className="mb-4 flex-row items-center rounded-[24px] border border-white/5 bg-white/[0.06] px-4 py-4"
      onPress={onPress}
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
            style={{ tintColor: "rgba(255, 255, 255, 0.95)" }}
          />
        ) : (
          <View className="h-3 w-3 rounded-full bg-white/85" />
        )}
      </View>

      <View className="flex-1">
        <Text className={`text-[16px] font-medium ${tone === "danger" ? "text-white/70" : "text-white"}`}>
          {label}
        </Text>
      </View>

      {detail ? <Text className="mr-3 text-xs text-white/45">{detail}</Text> : null}
      <Text className={`text-2xl ${tone === "danger" ? "text-white/28" : "text-white/55"}`}>{">"}</Text>
    </Pressable>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="mb-3 mt-2 px-1 text-xs font-medium uppercase tracking-[1.5px]"
      style={{ color: "rgba(255, 255, 255, 0.72)" }}
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
    notifications: require("../../assets/notifications_blanco.png"),
    password: require("../../assets/padlock_blanco.png"),
    twoFactor: require("../../assets/2fa_blanco.png"),
    out: require("../../assets/logout.png"),
    language: require("../../assets/language.png"),
  } satisfies Record<string, ImageSourcePropType>;

  return (
    <SafeAreaView className="flex-1 bg-[#060c17]">
      <View className="absolute inset-0">
        <View className="absolute inset-0 bg-[#060c17]" />
        <View className="absolute inset-x-0 top-0 h-[280px] bg-[#3a1b78]/18" />
        <View className="absolute right-[-30] top-0 h-64 w-64 rounded-full bg-[#6d34d8]/12" />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
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
              style={{ tintColor: "rgba(255, 255, 255, 0.95)" }}
            />
          </Pressable>
          <Text className="text-[24px] font-semibold text-white">Profile</Text>
          <Pressable
            className="h-11 w-11 items-center justify-center"
            onPress={() => {
              selectionHaptic();
              router.push("/two-factor" as never);
            }}
          >
            <Image
              className="h-5 w-5"
              resizeMode="contain"
              source={dashboardIcons.twoFactor}
              style={{ tintColor: "rgba(255, 255, 255, 0.95)" }}
            />
          </Pressable>
        </View>

        <Animated.View entering={sectionEntering(0)}>
          <SectionLabel label="Profile" />
          <Pressable
            className="flex-row items-center rounded-[26px] border border-white/5 bg-[#6a34d3]/35 px-4 py-4"
            onPress={() => {
              selectionHaptic();
              router.push("/change-password" as never);
            }}
          >
            <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-[#4b258d]">
              <Text className="text-lg font-bold text-white">{getInitials(session.user.name)}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-white">{firstName}</Text>
              <Text className="mt-1 text-sm text-white/65">{session.user.email}</Text>
              <Text className="mt-2 text-[11px] uppercase tracking-[1.3px] text-white/55">{role}</Text>
            </View>

            <Text className="text-2xl text-white/70">{">"}</Text>
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
