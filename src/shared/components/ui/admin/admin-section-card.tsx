import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type AdminSectionCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
}>;

export function AdminSectionCard({ children, eyebrow, title }: AdminSectionCardProps) {
  return (
    <View className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
      <Text className="text-xs font-medium uppercase tracking-[1.6px] text-white/62">{eyebrow}</Text>
      <Text className="mt-2 text-[22px] font-semibold text-white">{title}</Text>
      <View className="mt-5">{children}</View>
    </View>
  );
}
