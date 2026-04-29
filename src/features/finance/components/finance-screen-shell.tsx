import type { PropsWithChildren } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { FinanceBottomTabs, type FinanceTabKey } from "@/features/finance/components/finance-bottom-tabs";
import { useAppTheme } from "@/shared/lib/theme-context";

type FinanceScreenShellProps = PropsWithChildren<{
  activeTab: FinanceTabKey;
  eyebrow: string;
  subtitle: string;
  title: string;
}>;

export function FinanceScreenShell({
  activeTab,
  children,
  eyebrow,
  subtitle,
  title,
}: FinanceScreenShellProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      <ScrollView
        bounces={false}
        contentContainerClassName="gap-6 px-5 pb-32 pt-8"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(460).easing(Easing.out(Easing.quad))}>
          <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
            {eyebrow}
          </Text>
          <Text className="mt-3 text-[34px] font-black leading-10" style={{ color: theme.text }}>
            {title}
          </Text>
          <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            {subtitle}
          </Text>
        </Animated.View>
        {children}
      </ScrollView>
      <FinanceBottomTabs activeTab={activeTab} />
    </SafeAreaView>
  );
}
