import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type AdminUserNotificationRowProps = {
  email: string;
  name: string;
  role?: string | null;
  statusLabel?: string;
  disabled?: boolean;
  isPending?: boolean;
  onPress?: () => void;
  trailing?: ReactNode;
};

function pickAccents(role?: string | null) {
  const normalized = (role ?? "").toLowerCase();
  const isAdmin = normalized.split(",").map((value) => value.trim()).includes("admin");

  if (isAdmin) {
    return { accent: "#2e2950", iconAccent: "#8d7cff", highlight: "#8f64ff" };
  }

  return { accent: "#1f3640", iconAccent: "#67dbc8", highlight: "#67dbc8" };
}

export function AdminUserNotificationRow({
  disabled,
  email,
  isPending,
  name,
  onPress,
  role,
  statusLabel,
  trailing,
}: AdminUserNotificationRowProps) {
  const { theme } = useAppTheme();
  const accents = pickAccents(role);
  const isPressable = Boolean(onPress) && !disabled;

  return (
    <Pressable
      className="flex-row items-center px-2 py-5"
      disabled={!isPressable}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
      })}
    >
      <View
        className="mr-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: accents.accent }}
      >
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: accents.iconAccent }}
        >
          <View className="h-2.5 w-2.5 rounded-full bg-white/90" />
        </View>
      </View>

      <View className="flex-1">
        <Text className="text-[17px] font-semibold" style={{ color: theme.text }}>{name}</Text>
        <Text className="mt-1 text-sm" style={{ color: theme.mutedText }}>{email}</Text>
      </View>

      {trailing ? (
        trailing
      ) : isPending ? (
        <View className="ml-3 h-6 w-6 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : statusLabel ? (
        <View className="ml-3 h-3 w-3 rounded-full" style={{ backgroundColor: theme.primary }} />
      ) : (
        <View className="ml-3 h-3 w-3 rounded-full" style={{ backgroundColor: accents.highlight }} />
      )}
    </Pressable>
  );
}

