import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

type AdminScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  subtitle?: string;
  title: string;
  trailingAction?: ReactNode;
}>;

export function AdminScreenShell({
  children,
  eyebrow,
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
        contentContainerClassName="px-5 pb-10 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader fallbackHref="/admin" rightSlot={trailingAction} title="Admin" />

        <View className="border-t pt-4" style={{ borderColor: theme.border }}>
          <AppText className="mb-4 text-[11px] font-semibold uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>
            {eyebrow}
          </AppText>
          <AppText className="text-[22px] font-semibold leading-[28px]" style={{ color: theme.text }}>{title}</AppText>
        </View>

        <View className="mt-4 gap-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
