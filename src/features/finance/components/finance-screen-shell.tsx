import type { PropsWithChildren } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/shared/lib/theme-context";

type FinanceScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  subtitle: string;
  title: string;
}>;

export function FinanceScreenShell({
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
        contentContainerClassName="gap-6 px-5 pb-12 pt-8"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
            {eyebrow}
          </Text>
          <Text className="mt-3 text-[34px] font-black leading-10" style={{ color: theme.text }}>
            {title}
          </Text>
          <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            {subtitle}
          </Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
