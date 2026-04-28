import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type DashboardCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
}>;

export function DashboardCard({ children, eyebrow, title }: DashboardCardProps) {
  const { theme } = useAppTheme();

  return (
    <View className="rounded-[28px] border p-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <Text className="text-xs font-semibold uppercase tracking-[3px]" style={{ color: theme.mutedText }}>{eyebrow}</Text>
      <Text className="mt-3 text-2xl font-black" style={{ color: theme.text }}>{title}</Text>
      <View className="mt-4">{children}</View>
    </View>
  );
}
