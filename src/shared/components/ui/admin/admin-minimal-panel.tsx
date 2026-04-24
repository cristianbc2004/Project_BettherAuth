import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

export function AdminMinimalPanel({ children }: PropsWithChildren) {
  return (
    <View className="overflow-hidden rounded-[30px] border border-white/6 bg-[#0b1220]/40">
      {children}
    </View>
  );
}

type AdminMinimalSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function AdminMinimalSection({ children, description, title }: AdminMinimalSectionProps) {
  return (
    <View className="border-t border-white/6 px-4 py-5">
      <Text className="text-base font-semibold text-white">{title}</Text>
      {description ? <Text className="mt-2 text-[15px] leading-6 text-white/60">{description}</Text> : null}
      {children ? <View className="mt-5">{children}</View> : null}
    </View>
  );
}

