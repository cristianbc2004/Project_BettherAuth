import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type AdminUserRowProps = {
  action?: ReactNode;
  email: string;
  name: string;
  role?: string | null;
  statusLabel?: string;
};

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "US";
}

export function AdminUserRow({ action, email, name, role, statusLabel }: AdminUserRowProps) {
  const { theme } = useAppTheme();

  return (
    <View className="rounded-[26px] border p-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <View className="flex-row items-start">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: theme.primary }}>
          <Text className="text-sm font-bold" style={{ color: theme.textOnPrimary }}>{getInitials(name)}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-[17px] font-semibold" style={{ color: theme.text }}>{name}</Text>
          <Text className="mt-1 text-sm" style={{ color: theme.mutedText }}>{email}</Text>

          <View className="mt-3 flex-row flex-wrap items-center">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.1px]" style={{ color: theme.mutedText }}>
              {role ?? "user"}
            </Text>
            {statusLabel ? (
              <Text className="ml-2 text-[11px] font-semibold uppercase tracking-[1.1px]" style={{ color: theme.mutedText }}>
                {"\u00b7"} {statusLabel}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  );
}
