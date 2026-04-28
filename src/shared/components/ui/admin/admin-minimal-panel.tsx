import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

export function AdminMinimalPanel({ children }: PropsWithChildren) {
  return <View>{children}</View>;
}

type AdminMinimalSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function AdminMinimalSection({ children, description, title }: AdminMinimalSectionProps) {
  const { theme } = useAppTheme();

  return (
    <View className="border-t py-5" style={{ borderColor: theme.border }}>
      <Text className="text-base font-semibold" style={{ color: theme.text }}>{title}</Text>
      {description ? <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>{description}</Text> : null}
      {children ? <View className="mt-5">{children}</View> : null}
    </View>
  );
}

