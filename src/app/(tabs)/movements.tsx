import { Redirect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View, type ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Filter, Search } from "lucide-react-native";

import { TransactionRow } from "@/features/finance/components/transaction-row";
import {
  allTransactions,
  financeConfig,
  type Transaction,
} from "@/features/finance/mocks";
import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function MovementsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [visibleCount, setVisibleCount] = useState<number>(financeConfig.transactionBatchSize);
  const visibleTransactions = useMemo(
    () => allTransactions.slice(0, visibleCount),
    [visibleCount],
  );
  const hasMoreTransactions = visibleCount < financeConfig.totalTransactionCount;
  const handleLoadMore = useCallback(() => {
    setVisibleCount((currentCount) =>
      Math.min(currentCount + financeConfig.transactionBatchSize, financeConfig.totalTransactionCount),
    );
  }, []);
  const renderTransaction: ListRenderItem<Transaction> = useCallback(
    ({ item }) => <TransactionRow transaction={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Transaction) => item.id, []);
  const renderSeparator = useCallback(() => <View className="h-3" />, []);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      <FlatList
        ListFooterComponent={
          <View className="items-center pb-10 pt-4">
            <Text className="text-[12px] font-semibold" style={{ color: theme.mutedText }}>
              {hasMoreTransactions
                ? `Mostrando ${visibleTransactions.length} de ${financeConfig.totalTransactionCount}`
                : "Todos los movimientos cargados"}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View className="gap-5 pb-5 pt-8">
            <View>
              <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
                Actividad
              </Text>
              <Text className="mt-3 text-[34px] font-black" style={{ color: theme.text }}>
                Movimientos
              </Text>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center rounded-[22px] px-4 py-4" style={{ backgroundColor: theme.card }}>
                <Search color={theme.mutedText} size={20} strokeWidth={2.3} />
                <Text className="ml-3 text-[14px] font-semibold" style={{ color: theme.mutedText }}>
                  Buscar movimiento
                </Text>
              </View>
              <View className="h-[54px] w-[54px] items-center justify-center rounded-[22px]" style={{ backgroundColor: theme.card }}>
                <Filter color={theme.text} size={21} strokeWidth={2.4} />
              </View>
            </View>
          </View>
        }
        ItemSeparatorComponent={renderSeparator}
        bounces={false}
        contentContainerClassName="px-5 pb-12"
        contentInsetAdjustmentBehavior="automatic"
        data={visibleTransactions}
        initialNumToRender={18}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={24}
        onEndReached={hasMoreTransactions ? handleLoadMore : undefined}
        onEndReachedThreshold={0.35}
        removeClippedSubviews={true}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        updateCellsBatchingPeriod={24}
        windowSize={9}
      />
    </SafeAreaView>
  );
}
