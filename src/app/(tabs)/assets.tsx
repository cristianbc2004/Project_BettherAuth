import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowDownLeft, ArrowUpRight, Zap } from "lucide-react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";

import { FinanceScreenShell } from "@/features/finance/components/finance-screen-shell";
import { BizumSendSheet, type BizumSendPayload } from "@/features/finance/components/bizum-send-sheet";
import { authClient } from "@/features/auth/services/auth-client";
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

type BizumAction = "send" | "request";

const bizumMovements: BizumMovement[] = [
  {
    amount: "+13 EUR",
    date: "21/02/2026",
    id: "bizum-1",
    initials: "PA",
    name: "Paco AM",
    tone: "income",
  },
  {
    amount: "-10 EUR",
    date: "Ayer",
    id: "bizum-2",
    initials: "LR",
    name: "Luis RA",
    tone: "outcome",
  },
  {
    amount: "+5 EUR",
    date: "Hoy",
    id: "bizum-3",
    initials: "PZ",
    name: "Pepe ZC",
    tone: "income",
  },
  {
    amount: "-24 EUR",
    date: "Hoy",
    id: "bizum-4",
    initials: "ML",
    name: "Marta LO",
    tone: "outcome",
  },
];

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
  const [highlightedMovementId, setHighlightedMovementId] = useState<string | null>(null);
  const [movements, setMovements] = useState<BizumMovement[]>(bizumMovements);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const movementCountLabel = useMemo(() => `${movements.length} movimientos recientes`, [movements.length]);

  const openSendSheet = () => {
    selectionHaptic();
    setSelectedAction("send");
    setIsSendSheetVisible(true);
  };

  const closeSendSheet = () => {
    if (isSubmittingBizum) {
      return;
    }

    setIsSendSheetVisible(false);
  };

  const handleSendBizum = (payload: BizumSendPayload) => {
    setIsSubmittingBizum(true);

    setTimeout(() => {
      const nextMovementId = `bizum-${Date.now()}`;
      const nextMovement: BizumMovement = {
        amount: `-${payload.amount.toFixed(2).replace(".", ",")} EUR`,
        date: "Ahora",
        id: nextMovementId,
        initials: payload.contact.initials,
        name: payload.contact.alias,
        tone: "outcome",
      };

      setMovements((currentMovements) => [nextMovement, ...currentMovements]);
      setHighlightedMovementId(nextMovementId);
      setIsSubmittingBizum(false);
      setIsSendSheetVisible(false);

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedMovementId((currentId) => (currentId === nextMovementId ? null : currentId));
      }, 2600);
    }, 1200);
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
              {movementCountLabel}
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
            onPress={() => {
              selectionHaptic();
              setSelectedAction("request");
            }}
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

      <BizumSendSheet
        isSubmitting={isSubmittingBizum}
        onClose={closeSendSheet}
        onSubmit={handleSendBizum}
        visible={isSendSheetVisible}
      />
    </FinanceScreenShell>
  );
}
