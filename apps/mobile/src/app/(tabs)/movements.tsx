import { Redirect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, View, type ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MovementsFilterModal } from "@/features/finance/components/movements-filter-modal";
import { MovementsToolbar } from "@/features/finance/components/movements-toolbar";
import { TransactionRow } from "@/features/finance/components/transaction-row";
import {
  allTransactions,
  financeConfig,
  type Transaction,
} from "@/features/finance/mocks";
import {
  filterTransactions,
  getHasMoreTransactions,
  getNextVisibleCount,
  getVisibleTransactions,
  normalizeMovementSearchQuery,
  type MovementToneFilter,
} from "@/features/finance/lib/movements-list";
import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { AppText } from "@/shared/components/ui/app-text";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function MovementsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { contentBottomSpacing } = useFloatingTabBarMetrics();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedTone, setSelectedTone] = useState<MovementToneFilter>("all");
  const [draftTone, setDraftTone] = useState<MovementToneFilter>("all");
  const [visibleCount, setVisibleCount] = useState<number>(financeConfig.transactionBatchSize);
  const trimmedQuery = useMemo(() => normalizeMovementSearchQuery(searchQuery), [searchQuery]);
  const filteredTransactions = useMemo(
    () => filterTransactions(allTransactions, searchQuery, selectedTone),
    [searchQuery, selectedTone],
  );
  const visibleTransactions = useMemo(
    () => getVisibleTransactions(filteredTransactions, searchQuery, visibleCount),
    [filteredTransactions, searchQuery, visibleCount],
  );
  const hasActiveFilters = selectedTone !== "all";
  const hasMoreTransactions = getHasMoreTransactions(
    searchQuery,
    visibleCount,
    financeConfig.totalTransactionCount,
  );
  const handleLoadMore = useCallback(() => {
    setVisibleCount((currentCount) =>
      getNextVisibleCount(
        currentCount,
        financeConfig.transactionBatchSize,
        financeConfig.totalTransactionCount,
      ),
    );
  }, []);
  const renderTransaction: ListRenderItem<Transaction> = useCallback(
    ({ item }) => (
      <TransactionRow
        onDetailPress={(transaction) => router.navigate(`/home-graphic/expense-detail?transactionId=${transaction.id}` as never)}
        transaction={item}
      />
    ),
    [],
  );
  const keyExtractor = useCallback((item: Transaction) => item.id, []);
  const renderSeparator = useCallback(
    () => <View className="ml-16 h-px" style={{ backgroundColor: theme.border }} />,
    [theme.border],
  );
  const openFilters = useCallback(() => {
    setDraftTone(selectedTone);
    setIsFilterModalVisible(true);
  }, [selectedTone]);
  const closeFilters = useCallback(() => setIsFilterModalVisible(false), []);
  const acceptFilters = useCallback(() => {
    setSelectedTone(draftTone);
    setIsFilterModalVisible(false);
  }, [draftTone]);
  const cancelFilters = useCallback(() => {
    setDraftTone(selectedTone);
    setIsFilterModalVisible(false);
  }, [selectedTone]);

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
            <AppText tone="muted" variant="caption">
              {trimmedQuery
                ? `Results: ${visibleTransactions.length}`
                : hasMoreTransactions
                  ? `Showing ${visibleTransactions.length} of ${financeConfig.totalTransactionCount}`
                  : "All movements loaded"}
            </AppText>
          </View>
        }
        ListHeaderComponent={
          <View className="gap-4 pb-4 pt-5">
            <View>
              <AppScreenHeader title="Movements" />
            </View>

            <MovementsToolbar
              hasActiveFilters={hasActiveFilters}
              onOpenFilters={openFilters}
              onSearchQueryChange={setSearchQuery}
              searchQuery={searchQuery}
            />
          </View>
        }
        ItemSeparatorComponent={renderSeparator}
        bounces={false}
        contentContainerClassName="px-5"
        contentContainerStyle={{ paddingBottom: contentBottomSpacing }}
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
      <MovementsFilterModal
        draftTone={draftTone}
        onApply={acceptFilters}
        onClose={cancelFilters}
        onDraftToneChange={setDraftTone}
        visible={isFilterModalVisible}
      />
    </SafeAreaView>
  );
}
