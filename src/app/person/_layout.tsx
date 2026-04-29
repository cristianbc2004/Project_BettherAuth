import { Tabs } from "expo-router";
import { Image, type ImageSourcePropType } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

const tabIcons = {
  details: require("../../../assets/details.png"),
  general: require("../../../assets/general.png"),
  graphic: require("../../../assets/graphic.png"),
} satisfies Record<string, ImageSourcePropType>;

const activeTabColor = "#4F7DFF";
const inactiveTabColor = "#FFFFFF";

function TabIcon({ color, source }: { color: string; source: ImageSourcePropType }) {
  return (
    <Image
      resizeMode="contain"
      source={source}
      style={{
        height: 34,
        tintColor: color,
        width: 34,
      }}
    />
  );
}

export default function PersonTabsLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTabColor,
        tabBarIconStyle: {
          marginBottom: 6,
          marginTop: 8,
        },
        tabBarInactiveTintColor: inactiveTabColor,
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: "400",
          lineHeight: 20,
        },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 108,
          paddingBottom: 22,
          paddingTop: 12,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "General",
          tabBarIcon: ({ color }) => <TabIcon color={color} source={tabIcons.general} />,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: "Detalles",
          tabBarIcon: ({ color }) => <TabIcon color={color} source={tabIcons.details} />,
        }}
      />
      <Tabs.Screen
        name="graphic"
        options={{
          title: "Gráfica",
          tabBarIcon: ({ color }) => <TabIcon color={color} source={tabIcons.graphic} />,
        }}
      />
    </Tabs>
  );
}
