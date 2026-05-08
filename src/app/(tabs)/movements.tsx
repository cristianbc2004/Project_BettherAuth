import { Redirect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View, type ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Filter, Search } from "lucide-react-native";

import { TransactionRow } from "@/features/finance/components/transaction-row";
import {
  allTransactions,
  financeConfig,
  type Transaction,
} from "@/features/finance/mocks";
import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function MovementsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"all" | Transaction["tone"]>("all");
  const [draftTone, setDraftTone] = useState<"all" | Transaction["tone"]>("all");
  const [visibleCount, setVisibleCount] = useState<number>(financeConfig.transactionBatchSize);
  const trimmedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const matchesSearch =
        !trimmedQuery ||
        `${transaction.merchant} ${transaction.category} ${transaction.amount} ${transaction.time}`
          .toLowerCase()
          .includes(trimmedQuery);
      const matchesTone = selectedTone === "all" || transaction.tone === selectedTone;

      return matchesSearch && matchesTone;
    });
  }, [selectedTone, trimmedQuery]);
  const visibleTransactions = useMemo(() => {
    if (trimmedQuery) {
      return filteredTransactions;
    }

    return filteredTransactions.slice(0, visibleCount);
  }, [filteredTransactions, trimmedQuery, visibleCount]);
  const hasActiveFilters = selectedTone !== "all";
  const hasMoreTransactions = !trimmedQuery && visibleCount < financeConfig.totalTransactionCount;
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
  const openFilters = useCallback(() => {
    setDraftTone(selectedTone);
    setIsFilterModalVisible(true);
  }, [selectedTone]);
  const closeFilters = useCallback(() => setIsFilterModalVisible(false), []);
  const applyFilters = useCallback(() => {
    setSelectedTone(draftTone);
    setIsFilterModalVisible(false);
  }, [draftTone]);
  const clearFilters = useCallback(() => {
    setDraftTone("all");
    setSelectedTone("all");
    setIsFilterModalVisible(false);
  }, []);

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
              {trimmedQuery
                ? `Resultados: ${visibleTransactions.length}`
                : hasMoreTransactions
                  ? `Mostrando ${visibleTransactions.length} de ${financeConfig.totalTransactionCount}`
                  : "Todos los movimientos cargados"}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View className="gap-4 pb-4 pt-5">
            <View>
              <AppScreenHeader />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center rounded-[22px] px-4 py-4" style={{ backgroundColor: theme.card }}>
                <Search color={theme.mutedText} size={20} strokeWidth={2.3} />
                <TextInput
                  className="ml-3 flex-1 text-[14px] font-semibold"
                  onChangeText={setSearchQuery}
                  placeholder="Buscar movimiento"
                  placeholderTextColor={theme.mutedText}
                  selectionColor={theme.primary}
                  style={{ color: theme.text }}
                  value={searchQuery}
                />
              </View>
              <Pressable
                className="h-[54px] w-[54px] items-center justify-center rounded-[22px]"
                onPress={openFilters}
                style={{ backgroundColor: hasActiveFilters ? theme.primary : theme.card }}
              >
                <Filter color={theme.text} size={21} strokeWidth={2.4} />
              </Pressable>
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
      <Modal
        animationType="fade"
        onRequestClose={closeFilters}
        transparent
        visible={isFilterModalVisible}
      >
        <View className="flex-1 justify-end px-5 pb-7">
          <Pressable
            accessibilityLabel="Cerrar filtros"
            className="absolute inset-0"
            onPress={closeFilters}
            style={{ backgroundColor: "rgba(7, 10, 18, 0.45)" }}
          />
          <View
            className="rounded-[24px] border px-5 pb-5 pt-5"
            style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] font-black" style={{ color: theme.text }}>
                Filtros
              </Text>
              <Pressable onPress={closeFilters}>
                <Text className="text-[13px] font-semibold" style={{ color: theme.mutedText }}>
                  Cerrar
                </Text>
              </Pressable>
            </View>

            <View className="mt-5">
              <Text className="text-[12px] font-black uppercase tracking-[1px]" style={{ color: theme.primary }}>
                Tipo
              </Text>
              <View className="mt-4 gap-2">
                <Pressable
                  className="rounded-[16px] px-4 py-3.5"
                  onPress={() => setDraftTone("all")}
                  style={{ backgroundColor: draftTone === "all" ? theme.primary : theme.background }}
                >
                  <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                    Todos
                  </Text>
                </Pressable>
                <Pressable
                  className="rounded-[16px] px-4 py-3.5"
                  onPress={() => setDraftTone("income")}
                  style={{ backgroundColor: draftTone === "income" ? theme.primary : theme.background }}
                >
                  <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                    Ingresos
                  </Text>
                </Pressable>
                <Pressable
                  className="rounded-[16px] px-4 py-3.5"
                  onPress={() => setDraftTone("expense")}
                  style={{ backgroundColor: draftTone === "expense" ? theme.primary : theme.background }}
                >
                  <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                    Gastos
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-6 flex-row gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
              <Pressable
                className="flex-1 items-center rounded-[16px] px-4 py-4"
                onPress={clearFilters}
                style={{ backgroundColor: theme.background }}
              >
                <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                  Limpiar
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-[16px] px-4 py-4"
                onPress={applyFilters}
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                  Aplicar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
