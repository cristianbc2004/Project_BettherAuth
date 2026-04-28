import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { useAppTheme } from "@/shared/lib/theme-context";

type AdminScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  subtitle: string;
  title: string;
  trailingAction?: ReactNode;
}>;

export function AdminScreenShell({
  children,
  eyebrow,
  subtitle,
  title,
  trailingAction,
}: AdminScreenShellProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <AppBackButton fallbackHref="/admin" />

          <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>Admin</Text>

          {trailingAction ?? <View className="h-11 w-11" />}
        </View>

        <View className="rounded-[34px] border p-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <Text className="mb-4 text-[11px] font-semibold uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>
            {eyebrow}
          </Text>
          <Text className="text-[42px] font-semibold leading-[48px]" style={{ color: theme.text }}>{title}</Text>
          <Text className="mt-4 max-w-[360px] text-[15px] leading-6" style={{ color: theme.mutedText }}>{subtitle}</Text>
        </View>

        <View className="mt-6 gap-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
