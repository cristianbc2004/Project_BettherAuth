import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type AdminSectionCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
}>;

export function AdminSectionCard({ children, eyebrow, title }: AdminSectionCardProps) {
  const { theme } = useAppTheme();

  return (
    <View className="rounded-[28px] border p-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <Text className="text-xs font-medium uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>{eyebrow}</Text>
      <Text className="mt-2 text-[22px] font-semibold" style={{ color: theme.text }}>{title}</Text>
      <View className="mt-5">{children}</View>
    </View>
  );
}
