import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ArrowDownLeft, ArrowUpRight, Zap } from "lucide-react-native";
import Animated, { Easing, FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

import { FinanceScreenShell } from "@/features/finance/components/finance-screen-shell";
import { BizumOverviewSkeleton } from "@/features/finance/components/bizum-skeletons";
import {
  fetchBizumRequest,
  type BizumGetResponse,
} from "@/features/finance/lib/bizum-api";
import { authClient } from "@/features/auth/services/auth-client";
import { AppText } from "@/shared/components/ui/app-text";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type BizumMovement = {
  amount: string;
  date: string;
  id: string;
  initials: string;
  name: string;
  tone: "income" | "outcome";
};

function formatMovementDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ahora";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function SectionHeader({ onPress, title }: { onPress: () => void; title: string }) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between px-1">
      <AppText variant="sectionTitle">
        {title}
      </AppText>
      <Pressable
        accessibilityLabel="Ver todos los movimientos"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onPress}
      >
        <AppText className="text-[15px] font-black" tone="primary">
          Ver todos
        </AppText>
      </Pressable>
    </View>
  );
}

export default function AssetsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [isBizumDataLoading, setIsBizumDataLoading] = useState(true);
  const [bizumError, setBizumError] = useState<string | null>(null);
  const [availableBalanceCents, setAvailableBalanceCents] = useState(0);
  const [movements, setMovements] = useState<BizumMovement[]>([]);

  const loadBizumData = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    try {
      setIsBizumDataLoading(true);
      const response = await fetchBizumRequest();

      if (!response.ok) {
        setBizumError("No se pudo cargar Bizum. Intentalo de nuevo.");
        return;
      }

      const payload = (await response.json()) as BizumGetResponse;
      setAvailableBalanceCents(payload.availableBalanceCents ?? 0);
      setMovements(
        (payload.movements ?? []).map((movement) => ({
          amount: movement.amount,
          date: formatMovementDate(movement.createdAt),
          id: movement.id,
          initials: movement.initials,
          name: movement.name,
          tone: movement.tone,
        })),
      );
    } catch {
      setBizumError("No se pudo cargar Bizum. Intentalo de nuevo.");
    } finally {
      setIsBizumDataLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    void loadBizumData();
  }, [loadBizumData]);

  useFocusEffect(
    useCallback(() => {
      // Al volver de pagar una solicitud, refrescamos saldo y ultimos movimientos.
      void loadBizumData();
    }, [loadBizumData]),
  );

  const movementCountLabel = useMemo(() => `${movements.length} movimientos recientes`, [movements.length]);
  const availableBalanceLabel = useMemo(
    () => `${(availableBalanceCents / 100).toFixed(2).replace(".", ",")} EUR disponibles`,
    [availableBalanceCents],
  );

  const openSendSheet = () => {
    selectionHaptic();
    setBizumError(null);
    router.push("/bizum/send" as never);
  };

  const openRequestSheet = () => {
    selectionHaptic();
    setBizumError(null);
    router.push("/bizum/request" as never);
  };

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <FinanceScreenShell title="Bizum">
      {isBizumDataLoading ? (
        <BizumOverviewSkeleton />
      ) : (
        <>
      <View
        className="overflow-hidden rounded-[28px] border p-5"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderCurve: "continuous",
          boxShadow: "0 18px 40px rgba(7, 17, 31, 0.08)",
        }}
      >
        <View className="flex-row items-center">
          <View
            className="h-12 w-12 items-center justify-center rounded-[18px]"
            style={{ backgroundColor: theme.primarySoft }}
          >
            <Zap color={theme.primary} size={24} strokeWidth={2.7} />
          </View>
          <View className="ml-4 flex-1">
            <AppText variant="sectionTitle">
              {availableBalanceLabel}
            </AppText>
            <AppText className="mt-1 text-[13px]" tone="muted">
              {movementCountLabel}
            </AppText>
          </View>
        </View>

        <View className="mt-5 flex-row gap-4">
          <Pressable
            accessibilityLabel="Enviar Bizum"
            accessibilityRole="button"
            className="flex-1 items-center justify-center py-2"
            onPress={openSendSheet}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: theme.backgroundMuted,
              }}
            >
              <ArrowUpRight color={theme.text} size={26} strokeWidth={2.8} />
            </View>
            <AppText className="mt-3 text-[15px] font-black">
              Enviar
            </AppText>
          </Pressable>

          <Pressable
            accessibilityLabel="Pedir Bizum"
            accessibilityRole="button"
            className="flex-1 items-center justify-center py-2"
            onPress={openRequestSheet}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: theme.backgroundMuted,
              }}
            >
              <ArrowDownLeft color={theme.text} size={26} strokeWidth={2.8} />
            </View>
            <AppText className="mt-3 text-[15px] font-black">
              Pedir
            </AppText>
          </Pressable>
        </View>
      </View>

      <View className="gap-3">
        {bizumError ? (
          <Animated.View
            entering={FadeInDown.duration(220).easing(Easing.out(Easing.cubic))}
            exiting={FadeOutUp.duration(180).easing(Easing.in(Easing.cubic))}
            className="rounded-[24px] border px-4 py-3"
            style={{
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            }}
          >
            <AppText className="text-[14px] font-black leading-5">
              {bizumError}
            </AppText>
          </Animated.View>
        ) : null}

        <SectionHeader
          onPress={() => {
            selectionHaptic();
            router.navigate("/movements" as never);
          }}
          title="Ultimos movimientos"
        />

        <View>
          {movements.map((movement, index) => {
            const amountColor = movement.tone === "income" ? theme.success : theme.text;

            return (
              <Animated.View
                key={movement.id}
                entering={FadeInDown.duration(380).delay(index === 0 ? 50 : 0)}
                layout={LinearTransition.springify().damping(24).stiffness(220)}
              >
                <Pressable
                  accessibilityLabel={`${movement.name}, ${movement.amount}`}
                  accessibilityRole="button"
                  className="flex-row items-center rounded-[24px] px-3 py-4"
                  onPress={selectionHaptic}
                  style={{
                    backgroundColor: "transparent",
                  }}
                >
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: theme.backgroundMuted,
                    }}
                  >
                    <AppText
                      className="text-[14px] font-black tracking-[1px]"
                    >
                      {movement.initials}
                    </AppText>
                  </View>
                  <View className="flex-1 pr-3">
                    <AppText className="text-[16px] font-black" numberOfLines={1}>
                      {movement.name}
                    </AppText>
                    <View className="mt-1 flex-row items-center">
                      <AppText className="text-[13px]" numberOfLines={1} tone="muted">
                        {movement.date}
                      </AppText>
                    </View>
                  </View>
                  <AppText
                    className="text-[16px] font-black"
                    selectable
                    style={{ color: amountColor, fontVariant: ["tabular-nums"] }}
                  >
                    {movement.amount}
                  </AppText>
                </Pressable>
                {index < movements.length - 1 ? (
                  <View className="ml-16 h-px" style={{ backgroundColor: theme.border }} />
                ) : null}
              </Animated.View>
            );
          })}
        </View>
      </View>
        </>
      )}
    </FinanceScreenShell>
  );
}
