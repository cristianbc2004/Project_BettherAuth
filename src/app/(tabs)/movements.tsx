import { Redirect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Pressable, Text, TextInput, View, type ListRenderItem } from "react-native";
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
  const [isFilterDrawerMounted, setIsFilterDrawerMounted] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"all" | Transaction["tone"]>("all");
  const [draftTone, setDraftTone] = useState<"all" | Transaction["tone"]>("all");
  const [visibleCount, setVisibleCount] = useState<number>(financeConfig.transactionBatchSize);
  const drawerTranslateX = useRef(new Animated.Value(340)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
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
  const animateDrawerIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerTranslateX, {
        duration: 220,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerTranslateX, overlayOpacity]);
  const animateDrawerOut = useCallback(
    (onEnd?: () => void) => {
      Animated.parallel([
        Animated.timing(drawerTranslateX, {
          duration: 180,
          toValue: 340,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsFilterDrawerMounted(false);
          onEnd?.();
        }
      });
    },
    [drawerTranslateX, overlayOpacity],
  );
  const openFilters = useCallback(() => {
    setDraftTone(selectedTone);
    setIsFilterDrawerMounted(true);
    animateDrawerIn();
  }, [animateDrawerIn, selectedTone]);
  const closeFilters = useCallback(() => animateDrawerOut(), [animateDrawerOut]);
  const applyFilters = useCallback(() => {
    setSelectedTone(draftTone);
    animateDrawerOut();
  }, [animateDrawerOut, draftTone]);
  const clearFilters = useCallback(() => {
    setDraftTone("all");
    setSelectedTone("all");
    animateDrawerOut();
  }, [animateDrawerOut]);

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
          <View className="gap-5 pb-5 pt-8">
            <View>
              <AppScreenHeader title="Movimientos" />
              <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
                Actividad
              </Text>
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
      {isFilterDrawerMounted ? (
        <View className="absolute inset-0 flex-row">
          <Animated.View className="flex-1" style={{ opacity: overlayOpacity }}>
            <Pressable className="flex-1" onPress={closeFilters} style={{ backgroundColor: "rgba(7, 10, 18, 0.45)" }} />
          </Animated.View>
          <Animated.View
            className="h-full w-[84%] max-w-[340px] px-5 pb-7 pt-8"
            style={{ backgroundColor: theme.card, transform: [{ translateX: drawerTranslateX }] }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[22px] font-black" style={{ color: theme.text }}>
                Filtros
              </Text>
              <Pressable onPress={closeFilters}>
                <Text className="text-[13px] font-semibold" style={{ color: theme.mutedText }}>
                  Cerrar
                </Text>
              </Pressable>
            </View>

            <View className="mt-8">
              <Text className="text-[12px] font-black uppercase tracking-[1px]" style={{ color: theme.primary }}>
                Tipo
              </Text>
              <View className="mt-4 gap-3">
                <Pressable
                  className="rounded-[16px] px-4 py-4"
                  onPress={() => setDraftTone("all")}
                  style={{ backgroundColor: draftTone === "all" ? theme.primary : theme.background }}
                >
                  <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                    Todos
                  </Text>
                </Pressable>
                <Pressable
                  className="rounded-[16px] px-4 py-4"
                  onPress={() => setDraftTone("income")}
                  style={{ backgroundColor: draftTone === "income" ? theme.primary : theme.background }}
                >
                  <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                    Ingresos
                  </Text>
                </Pressable>
                <Pressable
                  className="rounded-[16px] px-4 py-4"
                  onPress={() => setDraftTone("expense")}
                  style={{ backgroundColor: draftTone === "expense" ? theme.primary : theme.background }}
                >
                  <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
                    Gastos
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-auto flex-row gap-3">
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
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
