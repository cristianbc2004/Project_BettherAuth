import { Redirect, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LineGraph, type GraphPoint } from "react-native-graph";
import Animated, { Easing, FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { IncomePeopleDrawer } from "@/features/ingresos/components/income-people-drawer";
import { HomeHeader } from "@/shared/components/ui/home-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type WeeklyBalancePoint = GraphPoint & {
  label: string;
};

type QuickAction = {
  icon: string;
  label: string;
};

type WalletCard = {
  balance: string;
  gradient: readonly [string, string, string];
  id: string;
  lastDigits: string;
  name: string;
  network: string;
  status: string;
  textColor: string;
};

type Transaction = {
  amount: string;
  category: string;
  id: string;
  merchant: string;
  time: string;
  tone: "expense" | "income";
};

type SectionHeaderProps = {
  action?: string;
  title: string;
};

type QuickActionButtonProps = QuickAction & {
  onPress: () => void;
};

type WalletCardPreviewProps = {
  card: WalletCard;
  width: number;
};

type TransactionRowProps = {
  transaction: Transaction;
};

type BottomNavItemProps = {
  active?: boolean;
  icon: string;
  label: string;
  onPress: () => void;
};

const weeklyBalance: WeeklyBalancePoint[] = [
  { date: new Date("2026-04-23T00:00:00"), label: "Jue", value: 6810 },
  { date: new Date("2026-04-24T00:00:00"), label: "Vie", value: 7025 },
  { date: new Date("2026-04-25T00:00:00"), label: "Sab", value: 6968 },
  { date: new Date("2026-04-26T00:00:00"), label: "Dom", value: 7288 },
  { date: new Date("2026-04-27T00:00:00"), label: "Lun", value: 7042 },
  { date: new Date("2026-04-28T00:00:00"), label: "Mar", value: 7176 },
  { date: new Date("2026-04-29T00:00:00"), label: "Mie", value: 7381 },
];

const quickActions: QuickAction[] = [
  { icon: "->", label: "Enviar" },
  { icon: "<-", label: "Recibir" },
  { icon: "+", label: "Anadir" },
  { icon: "...", label: "Ver todo" },
];

const walletCards: WalletCard[] = [
  {
    balance: "3.820 EUR",
    gradient: ["#111827", "#1f3b73", "#6ea8ff"],
    id: "visa-primary",
    lastDigits: "4832",
    name: "Cristian Vega",
    network: "VISA",
    status: "Principal",
    textColor: "#ffffff",
  },
  {
    balance: "1.146 EUR",
    gradient: ["#f7f2e8", "#d9e6df", "#5f8f7b"],
    id: "digital",
    lastDigits: "0927",
    name: "Cristian Vega",
    network: "DIGITAL",
    status: "Virtual",
    textColor: "#17231f",
  },
  {
    balance: "812 EUR",
    gradient: ["#242424", "#59524a", "#d3a85f"],
    id: "savings",
    lastDigits: "7741",
    name: "Ahorro personal",
    network: "VISA",
    status: "Ahorro",
    textColor: "#ffffff",
  },
];

const transactions: Transaction[] = [
  {
    amount: "-3,81 EUR",
    category: "Cafe y desayuno",
    id: "coffee",
    merchant: "Cafeteria Roma",
    time: "Hoy, 11:22",
    tone: "expense",
  },
  {
    amount: "-4,52 EUR",
    category: "Transporte",
    id: "metro",
    merchant: "Metro Madrid",
    time: "Hoy, 10:01",
    tone: "expense",
  },
  {
    amount: "+112,10 EUR",
    category: "Ingreso recibido",
    id: "income",
    merchant: "Bizum de Laura",
    time: "21/04/2026",
    tone: "income",
  },
];

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

function SectionHeader({ action, title }: SectionHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between px-1">
      <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
        {title}
      </Text>
      {action ? (
        <Text className="text-[13px] font-semibold" style={{ color: theme.primary }}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="flex-1 items-center gap-2"
      onPress={onPress}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-[22px]"
        style={{ backgroundColor: theme.backgroundMuted }}
      >
        <Text className="text-[18px] font-black" style={{ color: theme.text }}>
          {icon}
        </Text>
      </View>
      <Text className="text-[12px] font-semibold" numberOfLines={1} style={{ color: theme.mutedText }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ChipPlate({ color }: { color: string }) {
  return (
    <View
      className="h-9 w-12 overflow-hidden rounded-[10px] border"
      style={{ borderColor: `${color}66`, backgroundColor: `${color}22` }}
    >
      <View className="absolute left-0 top-1/2 h-px w-full" style={{ backgroundColor: `${color}55` }} />
      <View className="absolute left-1/2 top-0 h-full w-px" style={{ backgroundColor: `${color}55` }} />
      <View className="absolute left-3 top-0 h-full w-px" style={{ backgroundColor: `${color}33` }} />
      <View className="absolute right-3 top-0 h-full w-px" style={{ backgroundColor: `${color}33` }} />
    </View>
  );
}

function WalletCardPreview({ card, width }: WalletCardPreviewProps) {
  return (
    <LinearGradient
      className="mr-4 h-[188px] overflow-hidden rounded-[30px] p-5"
      colors={card.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderCurve: "continuous",
        boxShadow: "0 18px 34px rgba(7, 17, 31, 0.18)",
        width,
      }}
    >
      <View
        className="absolute -right-10 -top-10 h-36 w-36 rounded-full"
        style={{ backgroundColor: `${card.textColor}18` }}
      />
      <View
        className="absolute -bottom-14 left-12 h-40 w-40 rounded-full"
        style={{ backgroundColor: `${card.textColor}10` }}
      />

      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[12px] font-semibold uppercase tracking-[1.8px]" style={{ color: `${card.textColor}bb` }}>
            {card.status}
          </Text>
          <Text className="mt-2 text-[18px] font-bold" style={{ color: card.textColor }}>
            {card.balance}
          </Text>
        </View>
        <Text className="text-[19px] font-black tracking-[1.4px]" style={{ color: card.textColor }}>
          {card.network}
        </Text>
      </View>

      <View className="mt-9 flex-row items-center justify-between">
        <ChipPlate color={card.textColor} />
        <View className="flex-row gap-2">
          <View className="h-7 w-7 rounded-full" style={{ backgroundColor: `${card.textColor}55` }} />
          <View className="-ml-4 h-7 w-7 rounded-full" style={{ backgroundColor: `${card.textColor}33` }} />
        </View>
      </View>

      <View className="mt-auto flex-row items-end justify-between">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-[1.3px]" style={{ color: `${card.textColor}aa` }}>
            Titular
          </Text>
          <Text className="mt-1 text-[15px] font-bold" numberOfLines={1} style={{ color: card.textColor }}>
            {card.name}
          </Text>
        </View>
        <Text className="text-[15px] font-bold" style={{ color: card.textColor }}>
          **** {card.lastDigits}
        </Text>
      </View>
    </LinearGradient>
  );
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const { theme } = useAppTheme();
  const amountColor = transaction.tone === "income" ? theme.success : theme.text;

  return (
    <Pressable
      accessibilityLabel={`${transaction.merchant}, ${transaction.amount}`}
      accessibilityRole="button"
      className="flex-row items-center rounded-[24px] px-4 py-4"
      onPress={selectionHaptic}
      style={{ backgroundColor: theme.card }}
    >
      <View
        className="mr-4 h-12 w-12 items-center justify-center rounded-[18px]"
        style={{ backgroundColor: theme.backgroundMuted }}
      >
        <Text className="text-[18px] font-black" style={{ color: theme.text }}>
          {transaction.merchant.slice(0, 1)}
        </Text>
      </View>

      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-bold" numberOfLines={1} style={{ color: theme.text }}>
          {transaction.merchant}
        </Text>
        <Text className="mt-1 text-[12px]" numberOfLines={1} style={{ color: theme.mutedText }}>
          {transaction.time} - {transaction.category}
        </Text>
      </View>

      <Text
        className="text-[15px] font-black"
        selectable
        style={{ color: amountColor, fontVariant: ["tabular-nums"] }}
      >
        {transaction.amount}
      </Text>
    </Pressable>
  );
}

function BottomNavItem({ active, icon, label, onPress }: BottomNavItemProps) {
  const { theme } = useAppTheme();
  const color = active ? theme.primary : theme.mutedText;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="flex-1 items-center justify-center gap-1"
      onPress={onPress}
    >
      <Text className="text-[18px] font-black" style={{ color }}>
        {icon}
      </Text>
      <Text className="text-[10px] font-semibold" numberOfLines={1} style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<WeeklyBalancePoint | null>(null);
  const { resolvedThemeName, theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 72, 326);
  const graphColor = resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
  const firstName = session?.user.name.split(" ")[0] || session?.user.name || "Cristian";
  const highlightedPoint = selectedPoint ?? weeklyBalance[weeklyBalance.length - 1];
  const weekDelta = weeklyBalance[weeklyBalance.length - 1].value - weeklyBalance[0].value;
  const sectionEntering = (index: number) =>
    FadeInDown.duration(520)
      .delay(index * 90)
      .easing(Easing.out(Easing.quad));

  const balanceLabel = useMemo(() => formatCurrency(highlightedPoint.value), [highlightedPoint.value]);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const role = (session.user as { role?: string }).role ?? "Usuario";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="flex-1 px-5 pt-5">
        <HomeHeader
          onOpenMenu={() => {
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
          contentContainerClassName="gap-6 pb-32 pt-8"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.duration(520).easing(Easing.out(Easing.quad))}
          >
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
              }}
            >
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-[12px] font-bold uppercase tracking-[1.8px]" style={{ color: theme.mutedText }}>
                    Balance total
                  </Text>
                  <Text
                    className="mt-2 text-[40px] font-black"
                    selectable
                    style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
                  >
                    {balanceLabel}
                  </Text>
                </View>

                <View
                  className="rounded-full px-3 py-2"
                  style={{ backgroundColor: theme.primarySoft }}
                >
                  <Text className="text-[12px] font-black" style={{ color: theme.primary }}>
                    +{formatCurrency(weekDelta)}
                  </Text>
                </View>
              </View>

              <Text className="mt-2 text-[14px]" style={{ color: theme.mutedText }}>
                Resumen semanal - {highlightedPoint.label}
              </Text>

              <GestureHandlerRootView className="mt-5 h-[176px]">
                <LineGraph
                  animated={true}
                  color={graphColor}
                  enablePanGesture={true}
                  gradientFillColors={[`${graphColor}45`, `${graphColor}05`]}
                  horizontalPadding={8}
                  lineThickness={4}
                  onGestureEnd={() => setSelectedPoint(null)}
                  onGestureStart={selectionHaptic}
                  onPointSelected={(point) => {
                    const nextPoint = weeklyBalance.find(
                      (item) =>
                        item.date.getTime() === point.date.getTime() && item.value === point.value,
                    );

                    setSelectedPoint(nextPoint ?? null);
                  }}
                  panGestureDelay={80}
                  points={weeklyBalance}
                  style={{ flex: 1 }}
                  verticalPadding={18}
                />
              </GestureHandlerRootView>
            </View>
          </Animated.View>

          <Animated.View className="flex-row gap-3" entering={sectionEntering(2)}>
            {quickActions.map((action) => (
              <QuickActionButton
                icon={action.icon}
                key={action.label}
                label={action.label}
                onPress={selectionHaptic}
              />
            ))}
          </Animated.View>

          <Animated.View entering={sectionEntering(3)}>
            <SectionHeader action="Gestionar" title="Tus tarjetas" />
            <ScrollView
              className="mt-4 -mr-5"
              contentContainerClassName="pr-5"
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + 16}
              decelerationRate="fast"
            >
              {walletCards.map((card) => (
                <WalletCardPreview card={card} key={card.id} width={cardWidth} />
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View className="gap-3" entering={sectionEntering(4)}>
            <SectionHeader action="Ver todos" title="Ultimos movimientos" />
            <View className="gap-3">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>

      <Animated.View
        className="absolute bottom-5 left-5 right-5 h-[76px] flex-row items-center rounded-[28px] border px-2"
        entering={FadeInDown.duration(560).delay(360).easing(Easing.out(Easing.quad))}
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderCurve: "continuous",
          boxShadow: "0 14px 34px rgba(7, 17, 31, 0.16)",
        }}
      >
        <BottomNavItem active icon="H" label="Inicio" onPress={selectionHaptic} />
        <BottomNavItem icon="<>" label="Mov." onPress={selectionHaptic} />
        <BottomNavItem icon="V" label="Tarjetas" onPress={selectionHaptic} />
        <BottomNavItem icon="%" label="Activos" onPress={selectionHaptic} />
        <BottomNavItem
          icon="P"
          label="Perfil"
          onPress={() => {
            selectionHaptic();
            router.navigate("/dashboard" as never);
          }}
        />
      </Animated.View>

      <IncomePeopleDrawer
        email={session.user.email}
        isVisible={isDrawerOpen}
        name={session.user.name}
        onClose={() => setIsDrawerOpen(false)}
        role={role}
      />
    </SafeAreaView>
  );
}
