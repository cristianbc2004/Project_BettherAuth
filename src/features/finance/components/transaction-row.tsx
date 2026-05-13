import { memo } from "react";
import { Pressable, View } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import type { Transaction } from "@/shared/types/finance";
import { AppText } from "@/shared/components/ui/app-text";

type TransactionRowProps = {
  onDetailPress?: (transaction: Transaction) => void;
  transaction: Transaction;
};

function TransactionRowComponent({ onDetailPress, transaction }: TransactionRowProps) {
  const { theme } = useAppTheme();
  const Icon = transaction.icon;
  const amountColor = transaction.tone === "income" ? theme.success : theme.text;
  const handleDetailPress = () => {
    selectionHaptic();
    onDetailPress?.(transaction);
  };

  return (
    <View
      accessibilityLabel={`${transaction.merchant}, ${transaction.amount}`}
      className="flex-row items-center px-1 py-4"
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-[18px]" style={{ backgroundColor: theme.backgroundMuted }}>
        <Icon color={theme.text} size={21} strokeWidth={2.3} />
      </View>

      <View className="flex-1 pr-3">
        <AppText className="text-[15px] font-bold" numberOfLines={1} style={{ color: theme.text }}>
          {transaction.merchant}
        </AppText>
        <AppText className="mt-1 text-[12px]" numberOfLines={1} style={{ color: theme.mutedText }}>
          {transaction.time} - {transaction.category}
        </AppText>
      </View>

      <View className="items-end">
        <AppText className="text-[15px] font-black" selectable style={{ color: amountColor, fontVariant: ["tabular-nums"] }}>
          {transaction.amount}
        </AppText>
        {onDetailPress ? (
          <Pressable
            accessibilityLabel={`Ver detalle de ${transaction.merchant}`}
            accessibilityRole="button"
            className="mt-2 rounded-full px-3 py-1.5"
            onPress={handleDetailPress}
            style={{ backgroundColor: theme.backgroundMuted }}
          >
            <AppText className="text-[12px] font-black" tone="primary">
              Detalle
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const TransactionRow = memo(TransactionRowComponent);
