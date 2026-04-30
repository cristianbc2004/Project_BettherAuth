import { Redirect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LineGraph, type GraphPoint } from "react-native-graph";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Menu } from "lucide-react-native";

import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { TransactionRow } from "@/features/finance/components/transaction-row";
import {
  recentTransactions,
  walletCards,
  weeklyBalance,
  type WeeklyBalancePoint,
} from "@/features/finance/services/finance-mock";
import { authClient } from "@/features/auth/services/auth-client";
import { IncomePeopleDrawer } from "@/features/ingresos/components/income-people-drawer";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type SectionHeaderProps = {
  action?: string;
  onActionPress?: () => void;
  title: string;
};

type HomeBalancePoint = GraphPoint & {
  label: string;
};

type TopActionButtonProps = {
  accessibilityLabel: string;
  children: React.ReactNode;
  onPress: () => void;
};

function TopActionButton({ accessibilityLabel, children, onPress }: TopActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-12 w-12 items-center justify-center rounded-full"
      hitSlop={10}
      onPress={onPress}
    >
      {children}
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

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Buenos dias";
  }

  if (hour < 20) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

function isAdminRole(role: string) {
  return role
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes("admin");
}

function SectionHeader({ action, onActionPress, title }: SectionHeaderProps) {
  const { theme } = useAppTheme();
  const actionContent = action ? (
    <Text className="text-[15px] font-black" style={{ color: theme.primary }}>
      {action}
    </Text>
  ) : null;

  return (
    <View className="flex-row items-center justify-between px-1">
      <Text className="text-[26px] font-black" style={{ color: theme.text }}>
        {title}
      </Text>
      {action && onActionPress ? (
        <Pressable
          accessibilityLabel={action}
          accessibilityRole="button"
          hitSlop={10}
          onPress={onActionPress}
        >
          {actionContent}
        </Pressable>
      ) : (
        actionContent
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChartInteracting, setIsChartInteracting] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<HomeBalancePoint | null>(null);
  const { resolvedThemeName, theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 72, 326);
  const chartWidth = Math.max(width - 82, 260);
  const graphColor = resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
  const firstName = session?.user.name.split(" ")[0] || session?.user.name || "Cristian";
  const balancePoints = useMemo<HomeBalancePoint[]>(
    () =>
      weeklyBalance.map((point, index) => ({
        date: new Date(`2026-04-${(22 + index).toString().padStart(2, "0")}T00:00:00`),
        label: point.label,
        value: point.value,
      })),
    [],
  );
  const highlightedPoint = selectedPoint ?? balancePoints[balancePoints.length - 1];
  const periodDelta = highlightedPoint.value - balancePoints[0].value;
  const handlePointSelected = useCallback(
    (point: GraphPoint) => {
      const matchingPoint = balancePoints.find(
        (item) => item.date.getTime() === point.date.getTime() && item.value === point.value,
      );

      setSelectedPoint(matchingPoint ?? null);
    },
    [balancePoints],
  );
  const handleGestureStart = useCallback(() => {
    selectionHaptic();
    setIsChartInteracting(true);
  }, []);
  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
    setIsChartInteracting(false);
  }, []);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const role = (session.user as { role?: string }).role ?? "Usuario";
  const isAdmin = isAdminRole(role);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="flex-1 px-5 pt-5">
        <ScrollView
          bounces={false}
          contentContainerClassName="gap-7 pb-12 pt-4"
          contentInsetAdjustmentBehavior="automatic"
          scrollEnabled={!isChartInteracting}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 pr-3">
                <Text className="text-[31px] font-black leading-9" style={{ color: theme.text }}>
                  {getGreeting()}, {firstName}
                </Text>
                <Text className="mt-2 text-[16px] font-medium" style={{ color: theme.mutedText }}>
                  Aqui tienes tu resumen semanal
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                {isAdmin ? (
                  <TopActionButton
                    accessibilityLabel="Open menu"
                    onPress={() => {
                      selectionHaptic();
                      setIsDrawerOpen(true);
                    }}
                  >
                    <Menu color={theme.text} size={28} strokeWidth={2.3} />
                  </TopActionButton>
                ) : null}

                <TopActionButton
                  accessibilityLabel="Open notifications"
                  onPress={() => {
                    selectionHaptic();
                    router.navigate("/notifications" as never);
                  }}
                >
                  <Bell color={theme.text} size={24} strokeWidth={2.1} />
                </TopActionButton>
              </View>
            </View>
          </View>

          <View>
            <View
              className="overflow-hidden rounded-[34px] border p-5"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderCurve: "continuous",
                boxShadow: "0 18px 40px rgba(7, 17, 31, 0.08)",
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                    Balance total
                  </Text>
                  <AnimatedNumber
                    animateOnMount={true}
                    className="mt-3 text-[44px] font-black"
                    formatValue={(nextValue) => formatCurrency(Math.round(nextValue))}
                    style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
                    value={highlightedPoint.value}
                  />
                </View>

                <View className="rounded-full px-3 py-2" style={{ backgroundColor: theme.primarySoft }}>
                  <AnimatedNumber
                    animateOnMount={true}
                    className="text-[12px] font-black"
                    formatValue={(nextValue) => {
                      const roundedValue = Math.round(nextValue);
                      const sign = roundedValue > 0 ? "+" : "";

                      return `${sign}${formatCurrency(roundedValue)}`;
                    }}
                    style={{ color: theme.primary }}
                    value={periodDelta}
                  />
                </View>
              </View>

              <Text className="mt-1 text-[14px] font-semibold" style={{ color: theme.mutedText }}>
                {selectedPoint ? highlightedPoint.label : "Resumen semanal"}
              </Text>

              <GestureHandlerRootView className="mt-5">
                <View className="h-[208px]" style={{ width: chartWidth }}>
                  <LineGraph
                    animated={true}
                    color={graphColor}
                    enablePanGesture={true}
                    gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
                    horizontalPadding={16}
                    lineThickness={4}
                    onGestureEnd={handleGestureEnd}
                    onGestureStart={handleGestureStart}
                    onPointSelected={handlePointSelected}
                    panGestureDelay={40}
                    points={balancePoints}
                    style={{ flex: 1 }}
                    verticalPadding={20}
                  />
                </View>
              </GestureHandlerRootView>
            </View>
          </View>

          <View>
            <SectionHeader
              action="Gestionar"
              onActionPress={() => {
                selectionHaptic();
                router.navigate("/cards" as never);
              }}
              title="Tus tarjetas"
            />
            <ScrollView
              className="mt-4 -mr-5"
              contentContainerClassName="pr-5"
              decelerationRate="fast"
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + 16}
            >
              {walletCards.map((card) => (
                <WalletCardPreview card={card} key={card.id} width={cardWidth} />
              ))}
            </ScrollView>
          </View>

          <View className="gap-3">
            <SectionHeader
              action="Ver todos"
              onActionPress={() => {
                selectionHaptic();
                router.navigate("/movements" as never);
              }}
              title="Ultimos movimientos"
            />
            <View className="gap-3">
              {recentTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <IncomePeopleDrawer
        email={session.user.email}
        isVisible={isAdmin && isDrawerOpen}
        name={session.user.name}
        onClose={() => setIsDrawerOpen(false)}
        role={role}
      />
    </SafeAreaView>
  );
}
