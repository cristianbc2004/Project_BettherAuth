import { Redirect, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Menu } from "lucide-react-native";

import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { TransactionRow } from "@/features/finance/components/transaction-row";
import {
  recentTransactions,
  weeklyBalance,
} from "@/features/finance/mocks";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import { authClient } from "@/features/auth/services/auth-client";
import { AppDrawer } from "@/shared/components/ui/app-drawer";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { NativeLineChart, type NativeLineChartPoint } from "@/shared/components/ui/native-line-chart";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

type SectionHeaderProps = {
  action?: string;
  onActionPress?: () => void;
  title: string;
};

type HomeBalancePoint = NativeLineChartPoint & {
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
    <AppText className="text-[15px] font-black" style={{ color: theme.primary }}>
      {action}
    </AppText>
  ) : null;

  return (
    <View className="flex-row items-center justify-between px-1">
      <AppText className="text-[18px] font-black" style={{ color: theme.text }}>
        {title}
      </AppText>
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
  const { cards, refreshCards } = useWalletCards();
  const { resolvedThemeName, theme } = useAppTheme();
  const { contentBottomSpacing } = useFloatingTabBarMetrics();
  const { width } = useWindowDimensions();
  const cardNavigationLockRef = useRef(false);
  const chartNavigationLockRef = useRef(false);
  const cardGap = 16;
  const cardsViewportWidth = Math.max(width - 52, 250);
  const nextCardPeek = Math.round(Math.min(Math.max(cardsViewportWidth * 0.12, 32), 56));
  const cardWidth = Math.max(Math.round(cardsViewportWidth - cardGap - nextCardPeek), 190);
  const cardSnapInterval = cardWidth + cardGap;
  const chartWidth = Math.max(width - 82, 260);
  const graphColor = resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
  const screenBackgroundColor =
    resolvedThemeName === "light" ? theme.backgroundElevated : theme.background;
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
  const openBalanceGraph = useCallback(() => {
    if (chartNavigationLockRef.current) {
      return;
    }

    chartNavigationLockRef.current = true;
    selectionHaptic();
    router.push("/home-graphic" as never);
  }, []);
  const handlePointSelected = useCallback((point: HomeBalancePoint) => {
    setSelectedPoint(point);
  }, []);
  const handleGestureStart = useCallback(() => {
    selectionHaptic();
    setIsChartInteracting(true);
  }, []);
  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
    setIsChartInteracting(false);
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      void refreshCards();
    }
  }, [refreshCards, session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      cardNavigationLockRef.current = false;
      chartNavigationLockRef.current = false;
    }, []),
  );

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const role = (session.user as { role?: string }).role ?? "Usuario";
  const isAdmin = isAdminRole(role);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: screenBackgroundColor }}>
      <View className="absolute inset-0" style={{ backgroundColor: screenBackgroundColor }} />

      <View className="flex-1 px-5 pt-4">
        <AppScreenHeader
          backgroundColor={screenBackgroundColor}
          leftSlot={
            <TopActionButton
              accessibilityLabel="Open menu"
              onPress={() => {
                selectionHaptic();
                setIsDrawerOpen(true);
              }}
            >
              <Menu color={theme.text} size={28} strokeWidth={2.3} />
            </TopActionButton>
          }
          rightSlot={
            <TopActionButton
              accessibilityLabel="Open notifications"
              onPress={() => {
                selectionHaptic();
                router.navigate("/notification" as never);
              }}
            >
              <Bell color={theme.text} size={24} strokeWidth={2.1} />
            </TopActionButton>
          }
        />

        <ScrollView
          className="flex-1"
          bounces={false}
          contentContainerClassName="gap-6"
          contentContainerStyle={{ paddingBottom: contentBottomSpacing }}
          contentInsetAdjustmentBehavior="automatic"
          scrollEnabled={!isChartInteracting}
          showsVerticalScrollIndicator={false}
        >
          <View className="pr-3">
            <AppText className="text-[24px] font-black leading-8" style={{ color: theme.text }}>
              {getGreeting()}, {firstName}
            </AppText>
            <AppText className="mt-1 text-[13px] font-medium" style={{ color: theme.mutedText }}>
              Aqui tienes tu resumen semanal
            </AppText>
          </View>

          <View>
            <Pressable
              accessibilityHint="Abre la vista detallada de la grafica"
              accessibilityLabel="Abrir grafica detallada"
              accessibilityRole="button"
              className="overflow-hidden rounded-[28px] border p-5"
              onPress={openBalanceGraph}
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderCurve: "continuous",
                ...(resolvedThemeName === "dark"
                  ? { boxShadow: "0 18px 40px rgba(7, 17, 31, 0.08)" }
                  : {}),
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <AppText className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                    Balance total
                  </AppText>
                  <AnimatedNumber
                    animateOnMount={true}
                    className="mt-3 text-[32px] font-black leading-[40px]"
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

              <AppText className="mt-1 text-[14px] font-semibold leading-5" style={{ color: theme.mutedText }}>
                {selectedPoint ? highlightedPoint.label : "Resumen semanal"}
              </AppText>

              <View className="mt-5">
                <View className="h-[208px]" style={{ width: chartWidth }}>
                  <NativeLineChart
                    color={graphColor}
                    enablePanGesture={true}
                    gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
                    height={208}
                    horizontalPadding={16}
                    lineThickness={4}
                    onGestureEnd={handleGestureEnd}
                    onGestureStart={handleGestureStart}
                    onPointSelected={handlePointSelected}
                    onPress={openBalanceGraph}
                    panGestureDelay={40}
                    points={balancePoints}
                    verticalPadding={20}
                  />
                </View>
              </View>
              <AppText className="mt-3 text-[12px] font-semibold" style={{ color: theme.mutedText }}>
                Toca la grafica para ver el detalle por rango
              </AppText>
            </Pressable>
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
              className="mt-4"
              contentContainerStyle={{ paddingLeft: 4, paddingRight: 16 }}
              decelerationRate="fast"
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={cardSnapInterval}
            >
              {cards.map((card) => (
                <Pressable
                  accessibilityLabel={`Abrir tarjeta ${card.status}`}
                  accessibilityRole="button"
                  key={card.id}
                  onPress={() => {
                    if (cardNavigationLockRef.current) {
                      return;
                    }

                    cardNavigationLockRef.current = true;
                    selectionHaptic();
                    router.push({
                      params: { cardId: card.id },
                      pathname: "/targets/details",
                    } as never);
                  }}
                >
                  <WalletCardPreview card={card} width={cardWidth} />
                </Pressable>
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
              {recentTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <TransactionRow transaction={transaction} />
                  {index < recentTransactions.length - 1 ? (
                    <View className="ml-16 h-px" style={{ backgroundColor: theme.border }} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <AppDrawer
        email={session.user.email}
        isAdmin={isAdmin}
        isVisible={isDrawerOpen}
        name={session.user.name}
        onClose={() => setIsDrawerOpen(false)}
        role={role}
      />
    </SafeAreaView>
  );
}
