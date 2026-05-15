import { Redirect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { expenseCategories, type ExpenseCategory, weeklyBalance } from "@/features/finance/mocks";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { AppText } from "@/shared/components/ui/app-text";
import { NativeLineChart, type NativeLineChartPoint } from "@/shared/components/ui/native-line-chart";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type HomeGraphFilter = "3d" | "1m" | "3m";
type HomeGraphTab = "chart" | "detail";

type HomeGraphPoint = NativeLineChartPoint & {
  label: string;
};

type FilterChipProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

type GraphTabButtonProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

const filterLabels: Record<HomeGraphFilter, string> = {
  "3d": "ultimos 3 dias",
  "1m": "ultimo mes",
  "3m": "ultimos 3 meses",
};

function FilterChip({ isActive, label, onPress }: FilterChipProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="min-w-[86px] rounded-xl border px-4 py-3"
      onPress={onPress}
      style={{
        backgroundColor: isActive ? theme.primary : theme.backgroundElevated,
        borderColor: isActive ? theme.primary : theme.border,
      }}
    >
      <AppText
        className="text-center text-[14px] font-semibold leading-5"
        numberOfLines={1}
        style={{ color: isActive ? theme.textOnPrimary : theme.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function GraphTabButton({ isActive, label, onPress }: GraphTabButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      className="flex-1 rounded-xl px-4 py-3"
      onPress={onPress}
      style={{
        backgroundColor: isActive ? theme.backgroundElevated : "transparent",
        borderColor: isActive ? theme.border : "transparent",
        borderWidth: 1,
      }}
    >
      <AppText
        className="text-center text-[14px] font-black leading-5"
        style={{ color: isActive ? theme.text : theme.mutedText }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(value);
}

function formatSignedCurrency(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function buildHistory() {
  const totalDays = 96;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const source = weeklyBalance[index % weeklyBalance.length];
    const date = new Date(today);
    date.setDate(today.getDate() - (totalDays - index - 1));
    const wave = Math.round(Math.sin(index * 0.55) * 210);
    const trend = Math.round(index * 5.4);

    return {
      date,
      label: formatDateLabel(date),
      value: source.value + wave + trend,
    } satisfies HomeGraphPoint;
  });
}

function getSelectedRangeLabel(points: HomeGraphPoint[], selectedFilter: HomeGraphFilter) {
  if (points.length === 0) {
    return "Sin datos";
  }

  const start = points[0].date;
  const end = points[points.length - 1].date;

  return `${filterLabels[selectedFilter]} - ${formatDateLabel(start)} - ${formatDateLabel(end)}`;
}

function getExpenseMultiplier(selectedFilter: HomeGraphFilter) {
  if (selectedFilter === "3d") {
    return 0.28;
  }

  if (selectedFilter === "3m") {
    return 2.7;
  }

  return 1;
}

export default function HomeGraphicScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { resolvedThemeName, theme } = useAppTheme();
  const graphColor = resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
  const allPoints = useMemo<HomeGraphPoint[]>(() => buildHistory(), []);
  const [selectedFilter, setSelectedFilter] = useState<HomeGraphFilter>("1m");
  const [selectedTab, setSelectedTab] = useState<HomeGraphTab>("chart");
  const [selectedPoint, setSelectedPoint] = useState<HomeGraphPoint | null>(null);
  const [isChartInteracting, setIsChartInteracting] = useState(false);

  const filteredPoints = useMemo(() => {
    const sizeByFilter: Record<HomeGraphFilter, number> = {
      "3d": 3,
      "1m": 30,
      "3m": 90,
    };

    return allPoints.slice(-sizeByFilter[selectedFilter]);
  }, [allPoints, selectedFilter]);

  const graphPoints = useMemo(() => {
    if (filteredPoints.length !== 1) {
      return filteredPoints;
    }

    const onlyPoint = filteredPoints[0];
    const syntheticDate = new Date(onlyPoint.date);
    syntheticDate.setMinutes(syntheticDate.getMinutes() + 1);

    return [
      onlyPoint,
      {
        ...onlyPoint,
        date: syntheticDate,
      },
    ];
  }, [filteredPoints]);

  const isGraphInteractive = filteredPoints.length > 1;
  const highlightedPoint = selectedPoint ?? filteredPoints[filteredPoints.length - 1] ?? allPoints[allPoints.length - 1];
  const rangeSummary = getSelectedRangeLabel(filteredPoints, selectedFilter);
  const previousPeriodDelta = 100;
  const isPositiveDelta = previousPeriodDelta >= 0;
  const deltaTextColor = isPositiveDelta ? theme.success : theme.danger;
  const deltaBackgroundColor = isPositiveDelta
    ? resolvedThemeName === "dark"
      ? "rgba(52, 211, 153, 0.2)"
      : "rgba(5, 150, 105, 0.12)"
    : resolvedThemeName === "dark"
      ? "rgba(248, 113, 113, 0.2)"
      : "rgba(220, 38, 38, 0.12)";
  const deltaDirection = isPositiveDelta ? "\u25B3" : "\u25BD";
  const expenseMultiplier = getExpenseMultiplier(selectedFilter);
  const scaledExpenseCategories = expenseCategories.map((category) => ({
    ...category,
    amount: Math.round(category.amount * expenseMultiplier),
  }));
  const totalExpenses = scaledExpenseCategories.reduce((total, category) => total + category.amount, 0);

  const handleFilterPress = useCallback((filter: HomeGraphFilter) => {
    selectionHaptic();
    setSelectedPoint(null);
    setSelectedFilter(filter);
  }, []);

  const handleTabPress = useCallback((tab: HomeGraphTab) => {
    selectionHaptic();
    setSelectedTab(tab);
  }, []);

  const handlePointSelected = useCallback((point: HomeGraphPoint) => {
    setSelectedPoint(point);
  }, []);

  const handleGestureStart = useCallback(() => {
    selectionHaptic();
    setIsChartInteracting(true);
  }, []);

  const handleGestureEnd = useCallback(() => {
    setIsChartInteracting(false);
  }, []);

  const openExpenseCategory = useCallback((category: ExpenseCategory) => {
    selectionHaptic();
    router.navigate(`/home-graphic/expense-category?category=${encodeURIComponent(category.label)}` as never);
  }, []);

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <PersonScreenHeader backHref="/home" title="Grafica de balance" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-20"
        contentInsetAdjustmentBehavior="automatic"
        scrollEnabled={!isChartInteracting}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-7">
          <AppText className="text-[12px] font-black uppercase tracking-[1.4px]" style={{ color: theme.mutedText }}>
            Rango
          </AppText>
          <AppText className="mt-1 text-[14px] font-semibold leading-5" style={{ color: theme.mutedText }}>
            {rangeSummary}
          </AppText>

          <View className="mt-4 flex-row items-end justify-between gap-4">
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold leading-5" style={{ color: theme.mutedText }}>
                Saldo
              </AppText>
              <AnimatedNumber
                animateOnMount={true}
                className="mt-1 text-[34px] font-black leading-[42px]"
                formatValue={(nextValue) => formatCurrency(Math.round(nextValue))}
                style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
                value={highlightedPoint.value}
              />
            </View>

            <View className="mb-1 rounded-full px-3 py-2" style={{ backgroundColor: deltaBackgroundColor }}>
              <AppText className="text-[15px] font-black leading-5" style={{ color: deltaTextColor, fontVariant: ["tabular-nums"] }}>
                {deltaDirection} {formatSignedCurrency(previousPeriodDelta)}
              </AppText>
            </View>
          </View>

          <AppText className="mt-1 text-[14px] leading-5" style={{ color: theme.mutedText }}>
            Balance en {highlightedPoint.label}
          </AppText>

          <View
            accessibilityRole="tablist"
            className="mt-6 flex-row gap-2"
          >
            <GraphTabButton
              isActive={selectedTab === "chart"}
              label="Grafica"
              onPress={() => handleTabPress("chart")}
            />
            <GraphTabButton
              isActive={selectedTab === "detail"}
              label="Detalle"
              onPress={() => handleTabPress("detail")}
            />
          </View>

          {selectedTab === "chart" ? (
            <View className="mt-6">
              <AppText className="text-[18px] font-black leading-6" style={{ color: theme.text }}>
                Grafica
              </AppText>

              <View className="mt-5 h-[260px]">
                <NativeLineChart
                  color={graphColor}
                  enablePanGesture={isGraphInteractive}
                  gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
                  height={260}
                  horizontalPadding={12}
                  lineThickness={4}
                  onGestureEnd={handleGestureEnd}
                  onGestureStart={handleGestureStart}
                  onPointSelected={handlePointSelected}
                  panGestureDelay={40}
                  points={graphPoints}
                  verticalPadding={24}
                />
              </View>
            </View>
          ) : (
            <View className="mt-6">
              <AppText className="text-[18px] font-black leading-6" style={{ color: theme.text }}>
                Detalle
              </AppText>

              <View className="mt-4">
                <AppText className="text-[15px] font-black leading-5" style={{ color: theme.text }}>
                  Donde se ha gastado el dinero
                </AppText>

                <View className="mt-4 gap-3">
                  {scaledExpenseCategories.map((category) => {
                    const percentage = totalExpenses ? Math.round((category.amount / totalExpenses) * 100) : 0;

                    return (
                      <Pressable
                        accessibilityLabel={`Ver gastos de ${category.label}`}
                        accessibilityRole="button"
                        key={category.label}
                        onPress={() => openExpenseCategory(category)}
                      >
                        <View className="flex-row items-center justify-between gap-3">
                          <AppText className="text-[14px] font-semibold leading-5" style={{ color: theme.text }}>
                            {category.label}
                          </AppText>
                          <AppText
                            className="text-[14px] font-black leading-5"
                            style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
                          >
                            {formatCurrency(category.amount)} - {percentage}%
                          </AppText>
                        </View>
                        <View className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.backgroundMuted }}>
                          <View
                            className="h-full rounded-full"
                            style={{ backgroundColor: category.tone, width: `${percentage}%` }}
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          <View className="mt-6 border-t pt-5" style={{ borderColor: theme.border }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-2">
                <FilterChip
                  isActive={selectedFilter === "3d"}
                  label="3 dias"
                  onPress={() => handleFilterPress("3d")}
                />
                <FilterChip
                  isActive={selectedFilter === "1m"}
                  label="1 mes"
                  onPress={() => handleFilterPress("1m")}
                />
                <FilterChip
                  isActive={selectedFilter === "3m"}
                  label="3 meses"
                  onPress={() => handleFilterPress("3m")}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
