import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AppScreenHeaderProps = {
  backAccessibilityLabel?: string;
  backgroundColor?: string;
  fallbackHref?: Parameters<typeof backOrReplace>[0];
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
};

export function AppScreenHeader({
  backAccessibilityLabel,
  backgroundColor,
  fallbackHref,
  leftSlot,
  rightSlot,
  title,
}: AppScreenHeaderProps) {
  const { theme } = useAppTheme();

  const leftContent =
    leftSlot ?? (fallbackHref ? <AppBackButton accessibilityLabel={backAccessibilityLabel} fallbackHref={fallbackHref} /> : <View className="h-11 w-11" />);

  const resolvedBackgroundColor = backgroundColor ?? theme.background;

  return (
    <View
      className="mb-4 flex-row items-center"
      pointerEvents="box-none"
      style={[styles.container, { backgroundColor: resolvedBackgroundColor }]}
    >
      <View style={styles.actionLayer}>{leftContent}</View>

      {title ? (
        <View className="absolute left-0 right-0 items-center" pointerEvents="none">
          <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>
            {title}
          </Text>
        </View>
      ) : null}

      <View className="ml-auto" style={styles.actionLayer}>
        {rightSlot ? rightSlot : <View className="h-11 w-11" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionLayer: {
    zIndex: 2,
  },
  container: {
    elevation: 12,
    zIndex: 12,
  },
});
