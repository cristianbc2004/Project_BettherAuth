import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useAppTheme } from "@/shared/lib/theme-context";

export default function PersonTabsLayout() {
  const { theme } = useAppTheme();

  return (
    <NativeTabs
      backBehavior="history"
      backgroundColor={theme.card}
      badgeBackgroundColor={theme.primary}
      iconColor={{ default: theme.mutedText, selected: theme.primary }}
      indicatorColor={theme.primarySoft}
      labelStyle={{
        default: {
          color: theme.mutedText,
          fontSize: 11,
          fontWeight: "600",
        },
        selected: {
          color: theme.primary,
          fontSize: 11,
          fontWeight: "700",
        },
      }}
      labelVisibilityMode="labeled"
      rippleColor={theme.primarySoft}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon md="person" />
        <NativeTabs.Trigger.Label>General</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="details">
        <NativeTabs.Trigger.Icon md="description" />
        <NativeTabs.Trigger.Label>Detalles</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="graphic">
        <NativeTabs.Trigger.Icon md="bar_chart" />
        <NativeTabs.Trigger.Label>Grafica</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
