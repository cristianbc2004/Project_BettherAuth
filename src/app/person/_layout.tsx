import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useMemo } from "react";

import { useAppTheme } from "@/shared/lib/theme-context";

export default function PersonTabsLayout() {
  const { theme } = useAppTheme();
  const iconColor = useMemo(
    () => ({ default: theme.mutedText, selected: theme.primary }),
    [theme.mutedText, theme.primary],
  );
  const labelStyle = useMemo(
    () => ({
      default: {
        color: theme.mutedText,
        fontSize: 11,
        fontWeight: "600" as const,
      },
      selected: {
        color: theme.primary,
        fontSize: 11,
        fontWeight: "700" as const,
      },
    }),
    [theme.mutedText, theme.primary],
  );

  return (
    <NativeTabs
      backBehavior="history"
      backgroundColor={theme.background}
      badgeBackgroundColor={theme.primary}
      iconColor={iconColor}
      indicatorColor={theme.primarySoft}
      labelStyle={labelStyle}
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

      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Icon md="map" />
        <NativeTabs.Trigger.Label>Mapa</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
