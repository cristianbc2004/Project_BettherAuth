import type { ReactNode } from "react";
import { Text, View } from "react-native";

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
  return (
    <View className="rounded-[26px] border border-white/10 bg-white/[0.055] p-4">
      <View className="flex-row items-start">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-[#4b258d]">
          <Text className="text-sm font-bold text-white">{getInitials(name)}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-[17px] font-semibold text-white">{name}</Text>
          <Text className="mt-1 text-sm text-white/60">{email}</Text>

          <View className="mt-3 flex-row flex-wrap items-center">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.1px] text-white/70">
              {role ?? "user"}
            </Text>
            {statusLabel ? (
              <Text className="ml-2 text-[11px] font-semibold uppercase tracking-[1.1px] text-white/70">
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
