import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { useAppTheme } from "@/shared/lib/theme-context";

type FinanceScreenShellProps = PropsWithChildren<{
  eyebrow?: string;
  subtitle?: string;
  title?: string;
}>;

export function FinanceScreenShell({
  children,
}: FinanceScreenShellProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      <ScrollView
        bounces={false}
        contentContainerClassName="gap-5 px-5 pb-12 pt-5"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
