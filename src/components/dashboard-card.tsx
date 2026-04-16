import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type DashboardCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
}>;

export function DashboardCard({ children, eyebrow, title }: DashboardCardProps) {
  return (
    <View className="rounded-[28px] border border-white/10 bg-white/10 p-5">
      <Text className="text-xs font-semibold uppercase tracking-[3px] text-ink-200">{eyebrow}</Text>
      <Text className="mt-3 text-2xl font-black text-white">{title}</Text>
      <View className="mt-4">{children}</View>
    </View>
  );
}
