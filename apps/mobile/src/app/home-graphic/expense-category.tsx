import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, View, type ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { TransactionRow } from "@/features/finance/components/transaction-row";
import { allTransactions, getExpenseCategoryByLabel, type Transaction } from "@/features/finance/mocks";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { AppText } from "@/shared/components/ui/app-text";
import { useAppTheme } from "@/shared/lib/theme-context";

export default function ExpenseCategoryScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const categoryLabel = typeof categoryParam === "string" ? decodeURIComponent(categoryParam) : undefined;
  const category = getExpenseCategoryByLabel(categoryLabel);

  const filteredTransactions = useMemo(() => {
    if (!category) {
      return [];
    }

    return allTransactions
      .filter(
        (transaction) =>
          transaction.tone === "expense" &&
          category.matchCategories.includes(transaction.category),
      )
      .slice(0, 80);
  }, [category]);

  const totalAmount = useMemo(
    () =>
      filteredTransactions.reduce((total, transaction) => {
        const normalized = transaction.amount.replace(/[^\d,-]/g, "").replace(".", "").replace(",", ".");
        return total + Math.abs(Number(normalized) || 0);
      }, 0),
    [filteredTransactions],
  );

  const renderTransaction: ListRenderItem<Transaction> = useCallback(
    ({ item }) => (
      <TransactionRow
        onDetailPress={(transaction) => router.navigate(`/home-graphic/expense-detail?transactionId=${transaction.id}` as never)}
        transaction={item}
      />
    ),
    [],
  );

  const renderSeparator = useCallback(
    () => <View className="ml-16 h-px" style={{ backgroundColor: theme.border }} />,
    [theme.border],
  );

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <FlatList
        ListHeaderComponent={
          <View className="pb-4 pt-5">
            <PersonScreenHeader backHref="/home-graphic" title={category?.label ?? "Expenses"} />
            <AppText className="mt-2 text-[15px] font-semibold leading-5" style={{ color: theme.mutedText }}>
              Filtered expenses
            </AppText>
          </View>
        }
        ItemSeparatorComponent={renderSeparator}
        contentContainerClassName="px-5 pb-10"
        contentInsetAdjustmentBehavior="automatic"
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
