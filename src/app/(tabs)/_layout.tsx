import { ArrowLeftRight, CreditCard, House, User, Zap } from "lucide-react-native";
import { Redirect, Tabs } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { StartupSplashScreen } from "@/shared/components/ui/startup-splash-screen";
import { FLOATING_TAB_BAR_HEIGHT, useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { useAppTheme } from "@/shared/lib/theme-context";

export default function NativeTabsLayout() {
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const { bottomOffset } = useFloatingTabBarMetrics();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const tabBarStyle = useMemo(
    () => ({
      position: "absolute" as const,
      left: 32,
      right: 32,
      bottom: bottomOffset,
      height: FLOATING_TAB_BAR_HEIGHT,
      borderRadius: 36,
      backgroundColor: theme.card,
      borderTopWidth: 0,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 8,
      paddingTop: 10,
      paddingBottom: 10,
    }),
    [bottomOffset, theme.border, theme.card],
  );

  if (showSessionLoading) {
    return <StartupSplashScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 0,
        },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.mutedText,
        tabBarItemStyle: {
          borderRadius: 22,
          marginHorizontal: 2,
        },
        tabBarActiveBackgroundColor: "transparent",
      }}
      backBehavior="history"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? theme.primarySoft : "transparent",
                borderColor: focused ? theme.primarySoft : "transparent",
                borderWidth: 1,
                borderRadius: 999,
                padding: 6,
              }}
            >
              <House color={color} size={size} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="movements"
        options={{
          title: "Mov.",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? theme.primarySoft : "transparent",
                borderColor: focused ? theme.primarySoft : "transparent",
                borderWidth: 1,
                borderRadius: 999,
                padding: 6,
              }}
            >
              <ArrowLeftRight color={color} size={size} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: "Tarjetas",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? theme.primarySoft : "transparent",
                borderColor: focused ? theme.primarySoft : "transparent",
                borderWidth: 1,
                borderRadius: 999,
                padding: 6,
              }}
            >
              <CreditCard color={color} size={size} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="assets"
        options={{
          title: "Bizum",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? theme.primarySoft : "transparent",
                borderColor: focused ? theme.primarySoft : "transparent",
                borderWidth: 1,
                borderRadius: 999,
                padding: 6,
              }}
            >
              <Zap color={color} size={size} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? theme.primarySoft : "transparent",
                borderColor: focused ? theme.primarySoft : "transparent",
                borderWidth: 1,
                borderRadius: 999,
                padding: 6,
              }}
            >
              <User color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
