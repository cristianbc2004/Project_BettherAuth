import { ArrowLeftRight, CreditCard, House, User, Zap } from "lucide-react-native";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { AppFloatingTabBar } from "@/shared/components/ui/app-floating-tab-bar";
import { StartupSplashScreen } from "@/shared/components/ui/startup-splash-screen";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { useAppTheme } from "@/shared/lib/theme-context";

export default function NativeTabsLayout() {
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const showSessionLoading = useSessionLoadingDelay(isPending);

  if (showSessionLoading) {
    return <StartupSplashScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      tabBar={(props) => <AppFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
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
