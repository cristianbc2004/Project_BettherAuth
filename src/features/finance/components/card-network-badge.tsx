import { Text, View } from "react-native";

import type { WalletCardNetwork } from "@/features/finance/mocks";

type CardNetworkBadgeProps = {
  color: string;
  compact?: boolean;
  network: WalletCardNetwork;
};

export function CardNetworkBadge({ color, compact = false, network }: CardNetworkBadgeProps) {
  if (network === "MASTERCARD") {
    return (
      <View className="flex-row items-center">
        <View
          className={compact ? "h-5 w-5 rounded-full" : "h-7 w-7 rounded-full"}
          style={{ backgroundColor: "#ff5f00" }}
        />
        <View
          className={compact ? "-ml-2 h-5 w-5 rounded-full" : "-ml-3 h-7 w-7 rounded-full"}
          style={{ backgroundColor: "#eb001b" }}
        />
        <Text
          className={compact ? "ml-2 text-[10px] font-black tracking-[1px]" : "ml-3 text-[11px] font-black tracking-[1.2px]"}
          style={{ color }}
        >
          MASTERCARD
        </Text>
      </View>
    );
  }

  if (network === "VISA") {
    return (
      <View className="rounded-full px-3 py-2" style={{ backgroundColor: `${color}14` }}>
        <Text
          className={compact ? "text-[11px] font-black italic tracking-[1.5px]" : "text-[13px] font-black italic tracking-[1.8px]"}
          style={{ color }}
        >
          VISA
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-full px-3 py-2" style={{ backgroundColor: `${color}14` }}>
      <Text
        className={compact ? "text-[10px] font-black tracking-[1.4px]" : "text-[12px] font-black tracking-[1.8px]"}
        style={{ color }}
      >
        DIGITAL
      </Text>
    </View>
  );
}
