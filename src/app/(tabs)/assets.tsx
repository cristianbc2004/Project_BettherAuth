import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ArrowDownLeft, ArrowUpRight, Zap } from "lucide-react-native";
import Animated, { Easing, FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

import { FinanceScreenShell } from "@/features/finance/components/finance-screen-shell";
import {
  BizumActionSheet,
  type BizumActionPayload,
  type BizumContact,
} from "@/features/finance/components/bizum-action-sheet";
import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { appConfig } from "@/shared/lib/app-config";
import { selectionHaptic, successHaptic } from "@/shared/lib/haptics";
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

type BizumAction = "send" | "request";

type BizumMovementResponse = {
  amount: string;
  createdAt: string;
  id: string;
  initials: string;
  name: string;
  tone: "income" | "outcome";
};

type BizumGetResponse = {
  availableBalanceCents: number;
  contacts: BizumContact[];
  movements: BizumMovementResponse[];
};

type BizumPostResponse = {
  availableBalanceCents: number;
  request?: { amountCents: number; id: string };
  transfer?: BizumMovementResponse;
};

function getAuthCookie() {
  return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
}

async function fetchBizumRequest(path = "/api/bizum", init?: RequestInit) {
  return fetch(`${appConfig.authApiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: getAuthCookie(),
      ...init?.headers,
    },
  });
}

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
      <Text className="text-[26px] font-black" style={{ color: theme.text }}>
        {title}
      </Text>
      <Pressable
        accessibilityLabel="Ver todos los movimientos"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onPress}
      >
        <Text className="text-[15px] font-black" style={{ color: theme.primary }}>
          Ver todos
        </Text>
      </Pressable>
    </View>
  );
}

export default function AssetsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [selectedAction, setSelectedAction] = useState<BizumAction>("send");
  const [isSendSheetVisible, setIsSendSheetVisible] = useState(false);
  const [isSubmittingBizum, setIsSubmittingBizum] = useState(false);
  const [isBizumDataLoading, setIsBizumDataLoading] = useState(true);
  const [bizumError, setBizumError] = useState<string | null>(null);
  const [receivedNotification, setReceivedNotification] = useState<string | null>(null);
  const [highlightedMovementId, setHighlightedMovementId] = useState<string | null>(null);
  const [availableBalanceCents, setAvailableBalanceCents] = useState(0);
  const [contacts, setContacts] = useState<BizumContact[]>([]);
  const [movements, setMovements] = useState<BizumMovement[]>([]);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setContacts(payload.contacts ?? []);
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

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const movementCountLabel = useMemo(() => `${movements.length} movimientos recientes`, [movements.length]);
  const availableBalanceLabel = useMemo(
    () => `${(availableBalanceCents / 100).toFixed(2).replace(".", ",")} EUR disponibles`,
    [availableBalanceCents],
  );

  const openSendSheet = () => {
    selectionHaptic();
    setBizumError(null);
    setSelectedAction("send");
    setIsSendSheetVisible(true);
  };

  const openRequestSheet = () => {
    selectionHaptic();
    setBizumError(null);
    setSelectedAction("request");
    setIsSendSheetVisible(true);
  };

  const closeSendSheet = () => {
    if (isSubmittingBizum) {
      return;
    }

    setIsSendSheetVisible(false);
    setBizumError(null);
  };

  const showInsertedMovement = (nextMovement: BizumMovement) => {
    setMovements((currentMovements) => [nextMovement, ...currentMovements]);
    setHighlightedMovementId(nextMovement.id);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedMovementId((currentId) => (currentId === nextMovement.id ? null : currentId));
    }, 2600);
  };

  const showReceivedNotification = (message: string) => {
    setReceivedNotification(message);
    successHaptic();

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setReceivedNotification(null);
    }, 3200);
  };

  const handleBizumSubmit = async (payload: BizumActionPayload) => {
    const amountCents = Math.round(payload.amount * 100);

    if (selectedAction === "send" && amountCents > availableBalanceCents) {
      setBizumError("No tienes saldo suficiente para enviar ese Bizum.");
      return;
    }

    setBizumError(null);
    setIsSubmittingBizum(true);

    try {
      const [response] = await Promise.all([
        fetchBizumRequest("/api/bizum", {
          body: JSON.stringify({
            action: selectedAction,
            amount: payload.amount,
            concept: payload.concept,
            contactUserId: payload.contact.id,
          }),
          method: "POST",
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        setBizumError(errorPayload?.error ?? "No se pudo completar la operacion.");
        return;
      }

      const result = (await response.json()) as BizumPostResponse;
      setAvailableBalanceCents(result.availableBalanceCents ?? availableBalanceCents);

      if (selectedAction === "send" && result.transfer) {
        showInsertedMovement({
          amount: result.transfer.amount,
          date: "Ahora",
          id: result.transfer.id,
          initials: result.transfer.initials,
          name: result.transfer.name,
          tone: result.transfer.tone,
        });
      }

      if (selectedAction === "request") {
        showReceivedNotification(
          `Solicitud enviada a ${payload.contact.name} por ${payload.amount.toFixed(2).replace(".", ",")} EUR`,
        );
      }

      setIsSendSheetVisible(false);
    } catch {
      setBizumError("No se pudo completar la operacion.");
    } finally {
      setIsSubmittingBizum(false);
    }
  };

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <FinanceScreenShell
      eyebrow="Pagos"
      subtitle="Envia, solicita y revisa tus ultimos Bizum de forma rapida."
      title="Bizum"
    >
      <View
        className="overflow-hidden rounded-[34px] border p-5"
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
            <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
              Acciones rapidas
            </Text>
            <Text className="mt-1 text-[22px] font-black" style={{ color: theme.text }}>
              Gestiona tu Bizum
            </Text>
            <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
              {availableBalanceLabel}
            </Text>
            <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
              {isBizumDataLoading ? "Cargando movimientos..." : movementCountLabel}
            </Text>
          </View>
        </View>

        <View className="mt-6 flex-row gap-4">
          <Pressable
            accessibilityLabel="Enviar Bizum"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedAction === "send" }}
            className="flex-1 items-center justify-center py-2"
            onPress={openSendSheet}
          >
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{
                backgroundColor: selectedAction === "send" ? theme.primary : theme.backgroundMuted,
              }}
            >
              <ArrowUpRight
                color={selectedAction === "send" ? "#ffffff" : theme.text}
                size={30}
                strokeWidth={2.8}
              />
            </View>
            <Text
              className="mt-4 text-[18px] font-black"
              style={{ color: selectedAction === "send" ? theme.primary : theme.text }}
            >
              Enviar
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Pedir Bizum"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedAction === "request" }}
            className="flex-1 items-center justify-center py-2"
            onPress={openRequestSheet}
          >
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{
                backgroundColor: selectedAction === "request" ? theme.primary : theme.backgroundMuted,
              }}
            >
              <ArrowDownLeft
                color={selectedAction === "request" ? "#ffffff" : theme.text}
                size={30}
                strokeWidth={2.8}
              />
            </View>
            <Text
              className="mt-4 text-[18px] font-black"
              style={{ color: selectedAction === "request" ? theme.primary : theme.text }}
            >
              Pedir
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="gap-3">
        {bizumError && !isSendSheetVisible ? (
          <Animated.View
            entering={FadeInDown.duration(220).easing(Easing.out(Easing.cubic))}
            exiting={FadeOutUp.duration(180).easing(Easing.in(Easing.cubic))}
            className="rounded-[24px] border px-4 py-3"
            style={{
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            }}
          >
            <Text className="text-[14px] font-black leading-5" style={{ color: theme.text }}>
              {bizumError}
            </Text>
          </Animated.View>
        ) : null}

        {receivedNotification ? (
          <Animated.View
            entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))}
            exiting={FadeOutUp.duration(220).easing(Easing.in(Easing.cubic))}
            className="rounded-[24px] border px-4 py-3"
            style={{
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            }}
          >
            <Text className="text-[14px] font-black leading-5" style={{ color: theme.text }}>
              {receivedNotification}
            </Text>
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
            const isHighlighted = highlightedMovementId === movement.id;

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
                    backgroundColor: isHighlighted ? theme.primarySoft : "transparent",
                  }}
                >
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isHighlighted ? theme.primary : theme.backgroundMuted,
                    }}
                  >
                    <Text
                      className="text-[14px] font-black tracking-[1px]"
                      style={{ color: isHighlighted ? theme.textOnPrimary : theme.text }}
                    >
                      {movement.initials}
                    </Text>
                  </View>
                  <View className="flex-1 pr-3">
                    <Text className="text-[16px] font-black" numberOfLines={1} style={{ color: theme.text }}>
                      {movement.name}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <Text className="text-[13px]" numberOfLines={1} style={{ color: theme.mutedText }}>
                        {movement.date}
                      </Text>
                      {isHighlighted ? (
                        <View
                          className="ml-2 rounded-full px-2 py-1"
                          style={{ backgroundColor: theme.backgroundElevated }}
                        >
                          <Text className="text-[11px] font-black uppercase tracking-[1px]" style={{ color: theme.primary }}>
                            Nuevo
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Text
                    className="text-[16px] font-black"
                    selectable
                    style={{ color: amountColor, fontVariant: ["tabular-nums"] }}
                  >
                    {movement.amount}
                  </Text>
                </Pressable>
                {index < movements.length - 1 ? (
                  <View className="ml-16 h-px" style={{ backgroundColor: theme.border }} />
                ) : null}
              </Animated.View>
            );
          })}
        </View>
      </View>

      <BizumActionSheet
        contacts={contacts}
        errorMessage={bizumError}
        isSubmitting={isSubmittingBizum}
        mode={selectedAction}
        onClose={closeSendSheet}
        onDismissError={() => setBizumError(null)}
        onSubmit={handleBizumSubmit}
        visible={isSendSheetVisible}
      />
    </FinanceScreenShell>
  );
}
