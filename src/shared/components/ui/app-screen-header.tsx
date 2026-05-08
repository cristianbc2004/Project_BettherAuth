import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AppScreenHeaderProps = {
  backAccessibilityLabel?: string;
  backgroundColor?: string;
  fallbackHref?: Parameters<typeof backOrReplace>[0];
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title: string;
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

  return (
    <View className="mb-8 flex-row items-center" style={{ backgroundColor: backgroundColor ?? theme.background }}>
      {leftContent}

      <View className="absolute left-0 right-0 items-center" pointerEvents="none">
        <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>
          {title}
        </Text>
      </View>

      <View className="ml-auto">{rightSlot ? rightSlot : <View className="h-11 w-11" />}</View>
    </View>
  );
}
