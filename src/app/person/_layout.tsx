import { Tabs, useLocalSearchParams } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { ChartNoAxesCombined, FileText, UserRound } from "lucide-react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/shared/lib/theme-context";

type PersonTabName = "details" | "graphic" | "index";

type PersonTabConfig = {
  icon: ComponentType<any>;
  label: string;
};

const personTabs = {
  details: {
    icon: FileText,
    label: "Detalles",
  },
  graphic: {
    icon: ChartNoAxesCombined,
    label: "Grafica",
  },
  index: {
    icon: UserRound,
    label: "General",
  },
} satisfies Record<PersonTabName, PersonTabConfig>;

function isPersonTabName(routeName: string): routeName is PersonTabName {
  return routeName === "index" || routeName === "details" || routeName === "graphic";
}

function PersonTabBar({
  navigation,
  personId,
  state,
}: BottomTabBarProps & { personId?: string }) {
  const { theme } = useAppTheme();

  return (
    <Animated.View
      className="absolute bottom-5 left-5 right-5 h-[76px] flex-row items-center rounded-[28px] border px-2"
      entering={FadeInDown.duration(560).delay(220).easing(Easing.out(Easing.quad))}
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderCurve: "continuous",
        boxShadow: "0 16px 38px rgba(7, 17, 31, 0.18)",
      }}
    >
      {state.routes.map((route, index) => {
        if (!isPersonTabName(route.name)) {
          return null;
        }

        const tab = personTabs[route.name];
        const Icon = tab.icon;
        const isFocused = state.index === index;
        const color = isFocused ? theme.primary : theme.mutedText;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            className="flex-1 items-center justify-center gap-1"
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, personId ? { personId } : undefined);
              }
            }}
          >
            <View
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: isFocused ? theme.primarySoft : "transparent" }}
            >
              <Icon color={color} size={20} strokeWidth={isFocused ? 2.8 : 2.2} />
            </View>
            <Text className="text-[10px] font-semibold" numberOfLines={1} style={{ color }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

export default function PersonTabsLayout() {
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const personParams = personId ? { personId } : undefined;

  return (
    <Tabs
      backBehavior="none"
      tabBar={(props) => <PersonTabBar {...props} personId={personId} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: personParams ? { pathname: "/person", params: personParams } : "/person",
          title: "General",
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          href: personParams ? { pathname: "/person/details", params: personParams } : "/person/details",
          title: "Detalles",
        }}
      />
      <Tabs.Screen
        name="graphic"
        options={{
          href: personParams ? { pathname: "/person/graphic", params: personParams } : "/person/graphic",
          title: "Gr\u00e1fica",
        }}
      />
    </Tabs>
  );
}
