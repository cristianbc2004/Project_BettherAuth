import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import Animated, { Easing, FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { FinanceBottomTabs } from "@/features/finance/components/finance-bottom-tabs";
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

type BalanceChartProps = {
  color: string;
  points: WeeklyBalancePoint[];
  width: number;
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

function buildChartPaths(points: WeeklyBalancePoint[], width: number, height: number) {
  const chartPadding = 14;
  const chartWidth = width - chartPadding * 2;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const coordinates = points.map((point, index) => {
    const x = chartPadding + (chartWidth / (points.length - 1)) * index;
    const y = height - chartPadding - ((point.value - min) / range) * (height - chartPadding * 2);

    return { x, y };
  });
  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x.toFixed(2)} ${height - chartPadding} L ${coordinates[0].x.toFixed(2)} ${height - chartPadding} Z`;

  return { areaPath, coordinates, linePath };
}

function BalanceChart({ color, points, width }: BalanceChartProps) {
  const height = 132;
  const { areaPath, coordinates, linePath } = buildChartPaths(points, width, height);
  const lastPoint = coordinates[coordinates.length - 1];

  return (
    <View className="mt-5 overflow-hidden rounded-[26px]" style={{ height, width }}>
      <Svg height={height} width={width}>
        <Defs>
          <SvgLinearGradient id="balanceGradient" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.28" />
            <Stop offset="1" stopColor={color} stopOpacity="0.03" />
          </SvgLinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#balanceGradient)" />
        <Path d={linePath} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} />
        <Circle cx={lastPoint.x} cy={lastPoint.y} fill="#ffffff" r={6} />
        <Circle cx={lastPoint.x} cy={lastPoint.y} fill={color} r={3.4} />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { resolvedThemeName, theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 72, 326);
  const chartWidth = Math.max(width - 82, 260);
  const graphColor = resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
  const firstName = session?.user.name.split(" ")[0] || session?.user.name || "Cristian";
  const currentBalance = weeklyBalance[weeklyBalance.length - 1].value;
  const weekDelta = currentBalance - weeklyBalance[0].value;
  const balanceLabel = useMemo(() => formatCurrency(currentBalance), [currentBalance]);
  const deltaLabel = useMemo(() => formatCurrency(weekDelta), [weekDelta]);
  const sectionEntering = (index: number) =>
    FadeInDown.duration(520)
      .delay(index * 90)
      .easing(Easing.out(Easing.quad));

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
          contentContainerClassName="gap-7 pb-32 pt-8"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(520).easing(Easing.out(Easing.quad))}>
            <Text className="text-[31px] font-black leading-9" style={{ color: theme.text }}>
              {getGreeting()}, {firstName}
            </Text>
            <Text className="mt-2 text-[16px] font-medium" style={{ color: theme.mutedText }}>
              Aqui tienes tu resumen semanal
            </Text>
          </Animated.View>

          <Animated.View entering={sectionEntering(1)}>
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
                Resumen semanal
              </Text>

              <BalanceChart color={graphColor} points={weeklyBalance} width={chartWidth} />
            </View>
          </Animated.View>

          <Animated.View entering={sectionEntering(2)}>
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
          </Animated.View>

          <Animated.View className="gap-3" entering={sectionEntering(3)}>
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
          </Animated.View>
        </ScrollView>
      </View>

      <FinanceBottomTabs activeTab="home" />

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
