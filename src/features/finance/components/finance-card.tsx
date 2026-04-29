import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import type { WalletCard } from "@/features/finance/services/finance-mock";

type WalletCardPreviewProps = {
  card: WalletCard;
  width: number;
};

function ChipPlate({ color }: { color: string }) {
  return (
    <View
      className="h-9 w-12 overflow-hidden rounded-[10px] border"
      style={{ borderColor: `${color}66`, backgroundColor: `${color}22` }}
    >
      <View className="absolute left-0 top-1/2 h-px w-full" style={{ backgroundColor: `${color}55` }} />
      <View className="absolute left-1/2 top-0 h-full w-px" style={{ backgroundColor: `${color}55` }} />
      <View className="absolute left-3 top-0 h-full w-px" style={{ backgroundColor: `${color}33` }} />
      <View className="absolute right-3 top-0 h-full w-px" style={{ backgroundColor: `${color}33` }} />
    </View>
  );
}

export function WalletCardPreview({ card, width }: WalletCardPreviewProps) {
  return (
    <LinearGradient
      className="mr-4 h-[188px] overflow-hidden rounded-[30px] p-5"
      colors={card.gradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={{
        borderCurve: "continuous",
        width,
      }}
    >
      <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full" style={{ backgroundColor: `${card.textColor}18` }} />
      <View className="absolute -bottom-14 left-12 h-40 w-40 rounded-full" style={{ backgroundColor: `${card.textColor}10` }} />

      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[12px] font-semibold uppercase tracking-[1.8px]" style={{ color: `${card.textColor}bb` }}>
            {card.status}
          </Text>
          <Text className="mt-2 text-[18px] font-bold" style={{ color: card.textColor }}>
            {card.balance}
          </Text>
        </View>
        <Text className="text-[19px] font-black tracking-[1.4px]" style={{ color: card.textColor }}>
          {card.network}
        </Text>
      </View>

      <View className="mt-9 flex-row items-center justify-between">
        <ChipPlate color={card.textColor} />
        <View className="flex-row">
          <View className="h-7 w-7 rounded-full" style={{ backgroundColor: `${card.textColor}55` }} />
          <View className="-ml-3 h-7 w-7 rounded-full" style={{ backgroundColor: `${card.textColor}33` }} />
        </View>
      </View>

      <View className="mt-auto flex-row items-end justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.3px]" style={{ color: `${card.textColor}aa` }}>
            Titular
          </Text>
          <Text className="mt-1 text-[15px] font-bold" numberOfLines={1} style={{ color: card.textColor }}>
            {card.name}
          </Text>
        </View>
        <Text className="text-[15px] font-bold" style={{ color: card.textColor }}>
          **** {card.lastDigits}
        </Text>
      </View>
    </LinearGradient>
  );
}
