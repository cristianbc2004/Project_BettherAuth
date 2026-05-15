import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { AppText } from "@/shared/components/ui/app-text";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AppScreenHeaderProps = {
  backAccessibilityLabel?: string;
  backgroundColor?: string;
  fallbackHref?: Parameters<typeof backOrReplace>[0];
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  showDivider?: boolean;
  title?: string;
};

export function AppScreenHeader({
  backAccessibilityLabel,
  backgroundColor,
  fallbackHref,
  leftSlot,
  rightSlot,
  showDivider = true,
  title,
}: AppScreenHeaderProps) {
  const { theme } = useAppTheme();

  const leftContent =
    leftSlot ?? (fallbackHref ? <AppBackButton accessibilityLabel={backAccessibilityLabel} fallbackHref={fallbackHref} /> : <View className="h-11 w-11" />);

  const resolvedBackgroundColor = backgroundColor ?? theme.background;

  return (
    <View className="mb-4" pointerEvents="box-none" style={styles.container}>
      <View
        className="flex-row items-center"
        style={{ backgroundColor: resolvedBackgroundColor }}
      >
        <View style={styles.actionLayer}>{leftContent}</View>

        {title ? (
          <View className="absolute left-0 right-0 items-center" pointerEvents="none">
            <AppText variant="screenTitle">
              {title}
            </AppText>
          </View>
        ) : null}

        <View className="ml-auto" style={styles.actionLayer}>
          {rightSlot ? rightSlot : <View className="h-11 w-11" />}
        </View>
      </View>
      {showDivider ? <View className="mt-4 h-px" style={{ backgroundColor: theme.border }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionLayer: {
    zIndex: 2,
  },
  container: {
    zIndex: 12,
  },
});
