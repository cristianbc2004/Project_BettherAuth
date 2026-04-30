import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useAppTheme } from "@/shared/lib/theme-context";

export default function NativeTabsLayout() {
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
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon md="home" />
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="movements">
        <NativeTabs.Trigger.Icon md="sync_alt" />
        <NativeTabs.Trigger.Label>Mov.</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cards">
        <NativeTabs.Trigger.Icon md="credit_card" />
        <NativeTabs.Trigger.Label>Tarjetas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="assets">
        <NativeTabs.Trigger.Icon md="bolt" />
        <NativeTabs.Trigger.Label>Bizum</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="dashboard">
        <NativeTabs.Trigger.Icon md="person" />
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
