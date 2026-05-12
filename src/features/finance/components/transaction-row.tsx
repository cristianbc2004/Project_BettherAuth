import { memo } from "react";
import { Pressable, View } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import type { Transaction } from "@/shared/types/finance";
import { AppText } from "@/shared/components/ui/app-text";

type TransactionRowProps = {
  transaction: Transaction;
};

function TransactionRowComponent({ transaction }: TransactionRowProps) {
  const { theme } = useAppTheme();
  const Icon = transaction.icon;
  const amountColor = transaction.tone === "income" ? theme.success : theme.text;

  return (
    <Pressable
      accessibilityLabel={`${transaction.merchant}, ${transaction.amount}`}
      accessibilityRole="button"
      className="flex-row items-center px-1 py-4"
      onPress={selectionHaptic}
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

      <AppText className="text-[15px] font-black" selectable style={{ color: amountColor, fontVariant: ["tabular-nums"] }}>
        {transaction.amount}
      </AppText>
    </Pressable>
  );
}

export const TransactionRow = memo(TransactionRowComponent);
