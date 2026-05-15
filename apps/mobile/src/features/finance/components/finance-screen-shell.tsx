import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { useAppTheme } from "@/shared/lib/theme-context";

type FinanceScreenShellProps = PropsWithChildren<{
  eyebrow?: string;
  subtitle?: string;
  title?: string;
}>;

export function FinanceScreenShell({
  children,
  title,
}: FinanceScreenShellProps) {
  const { theme } = useAppTheme();
  const { contentBottomSpacing } = useFloatingTabBarMetrics();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      <ScrollView
        bounces={false}
        contentContainerClassName="gap-5 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: contentBottomSpacing }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader title={title} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
