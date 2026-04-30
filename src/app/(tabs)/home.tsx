import { Redirect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LineGraph, type GraphPoint } from "react-native-graph";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { HomeHeader } from "@/shared/components/ui/home-header";
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

function AxisLabel({ label, title, value }: { label: string; title: string; value: number }) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[11px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
        {title}
      </Text>
      <Text className="text-[11px] font-semibold" style={{ color: theme.text }}>
        {label} - {formatCurrency(value)}
      </Text>
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
  const currentBalance = balancePoints[balancePoints.length - 1].value;
  const highlightedPoint = selectedPoint ?? balancePoints[balancePoints.length - 1];
  const periodDelta = highlightedPoint.value - balancePoints[0].value;
  const balanceLabel = useMemo(() => formatCurrency(highlightedPoint.value), [highlightedPoint.value]);
  const deltaLabel = useMemo(() => formatCurrency(periodDelta), [periodDelta]);
  const maxPoint = useMemo(
    () => balancePoints.reduce((currentMax, point) => (point.value > currentMax.value ? point : currentMax)),
    [balancePoints],
  );
  const minPoint = useMemo(
    () => balancePoints.reduce((currentMin, point) => (point.value < currentMin.value ? point : currentMin)),
    [balancePoints],
  );
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
        <HomeHeader
          canOpenMenu={isAdmin}
          onOpenMenu={() => {
            if (!isAdmin) {
              return;
            }

            selectionHaptic();
            setIsDrawerOpen(true);
          }}
          onOpenNotifications={() => {
            selectionHaptic();
            router.navigate("/notifications" as never);
          }}
        />

        <ScrollView
          bounces={false}
          contentContainerClassName="gap-7 pb-12 pt-8"
          contentInsetAdjustmentBehavior="automatic"
          scrollEnabled={!isChartInteracting}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="text-[31px] font-black leading-9" style={{ color: theme.text }}>
              {getGreeting()}, {firstName}
            </Text>
            <Text className="mt-2 text-[16px] font-medium" style={{ color: theme.mutedText }}>
              Aqui tienes tu resumen semanal
            </Text>
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
                  <Text
                    className="mt-3 text-[44px] font-black"
                    selectable
                    style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
                  >
                    {balanceLabel}
                  </Text>
                </View>

                <View className="rounded-full px-3 py-2" style={{ backgroundColor: theme.primarySoft }}>
                  <Text className="text-[12px] font-black" style={{ color: theme.primary }}>
                    +{deltaLabel}
                  </Text>
                </View>
              </View>

              <Text className="mt-1 text-[14px] font-semibold" style={{ color: theme.mutedText }}>
                {selectedPoint ? highlightedPoint.label : "Resumen semanal"}
              </Text>

              <GestureHandlerRootView className="mt-5">
                <View className="h-[208px]" style={{ width: chartWidth }}>
                  <LineGraph
                    BottomAxisLabel={() => (
                      <AxisLabel label={minPoint.label} title="Menor" value={minPoint.value} />
                    )}
                    TopAxisLabel={() => (
                      <AxisLabel label={maxPoint.label} title="Mayor" value={maxPoint.value} />
                    )}
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
