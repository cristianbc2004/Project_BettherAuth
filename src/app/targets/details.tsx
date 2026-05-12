import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react-native";
import Animated, { Easing, FadeInDown, SlideInLeft } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import { type WalletCard } from "@/features/finance/mocks";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic, warningHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type ActionButtonProps = {
  disabled?: boolean;
  icon: typeof Eye;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
};

function ActionButton({ disabled = false, icon: Icon, label, onPress, tone = "default" }: ActionButtonProps) {
  const { theme } = useAppTheme();
  const isDanger = tone === "danger";

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="flex-1 px-2 py-2"
      disabled={disabled}
      onPress={onPress}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-[16px]"
        style={{ backgroundColor: isDanger ? `${theme.danger}18` : theme.backgroundMuted }}
      >
        <Icon color={isDanger ? theme.danger : theme.text} size={21} strokeWidth={2.3} />
      </View>

      <Text className="mt-3 text-[14px] font-black" style={{ color: isDanger ? theme.danger : theme.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-1 border-t px-1 py-4" style={{ borderColor: theme.border }}>
      <Text className="text-[12px] font-black uppercase tracking-[1.8px]" style={{ color: theme.mutedText }}>
        {label}
      </Text>
      <Text className="mt-3 text-[16px] font-black" style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}

export default function DetailsTargetScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { cardId } = useLocalSearchParams<{ cardId?: string | string[] }>();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { cards, refreshCards, updateCardBlock } = useWalletCards();
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isBlockPending, setIsBlockPending] = useState(false);
  const resolvedCardId = Array.isArray(cardId) ? cardId[0] : cardId;
  const selectedCard = useMemo<WalletCard>(
    () => cards.find((card) => card.id === resolvedCardId) ?? cards[0],
    [cards, resolvedCardId],
  );
  const cardWidth = Math.min(width - 40, 360);
  const displayedPin = selectedCard ? (isPinVisible ? selectedCard.cvc : "****") : "****";
  const isBlocked = selectedCard?.isBlocked ?? false;
  const sectionEnter = (delay: number) =>
    FadeInDown.duration(300).delay(delay).easing(Easing.out(Easing.cubic));
  const cardEnter = SlideInLeft.duration(380).delay(120).easing(Easing.out(Easing.cubic));

  useEffect(() => {
    if (session?.user.id) {
      void refreshCards();
    }
  }, [refreshCards, session?.user.id]);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!selectedCard) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="px-5 pt-4">
        <AppScreenHeader
          fallbackHref={"/cards" as never}
          title="Detalle de la tarjeta"
        />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="gap-5 px-5 pb-12"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={sectionEnter(90)} className="items-end">
            <View
              className="rounded-full px-4 py-3"
              style={{ backgroundColor: isBlocked ? `${theme.danger}18` : theme.primarySoft }}
            >
              <Text
                className="text-[13px] font-black uppercase tracking-[1.5px]"
                style={{ color: isBlocked ? theme.danger : theme.primary }}
              >
                {isBlocked ? "Bloqueada" : "Activa"}
              </Text>
            </View>
        </Animated.View>

        <Animated.View entering={cardEnter}>
          <WalletCardPreview card={selectedCard} width={cardWidth} />
        </Animated.View>

        <Animated.View entering={sectionEnter(210)} className="flex-row gap-3">
          <ActionButton
            icon={isPinVisible ? EyeOff : Eye}
            label={isPinVisible ? "Ocultar PIN" : "Ver PIN"}
            onPress={() => {
              selectionHaptic();
              setIsPinVisible((currentValue) => !currentValue);
            }}
          />
          <ActionButton
            icon={isBlocked ? ShieldCheck : LockKeyhole}
            disabled={isBlockPending}
            label={isBlockPending ? "Guardando" : isBlocked ? "Desbloquear" : "Bloquear"}
            onPress={async () => {
              try {
                selectionHaptic();
                setIsBlockPending(true);
                await updateCardBlock(selectedCard.id, !isBlocked);
              } catch (error) {
                const message = error instanceof Error ? error.message : "No se pudo actualizar la tarjeta.";
                warningHaptic();
                Alert.alert("Error", message);
              } finally {
                setIsBlockPending(false);
              }
            }}
            tone={isBlocked ? "default" : "danger"}
          />
        </Animated.View>

        <Animated.View entering={sectionEnter(270)} className="px-2 py-2">
          <Text className="text-[12px] font-black uppercase tracking-[1.8px]" style={{ color: theme.mutedText }}>
            PIN
          </Text>
          <Text
            className="mt-3 text-[28px] font-black tracking-[5px]"
            style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
          >
            {displayedPin}
          </Text>
          <Text className="mt-3 text-[14px] leading-6" style={{ color: theme.mutedText }}>
            {isPinVisible
              ? "No compartas este codigo con nadie."
              : "Pulsa en Ver PIN para mostrar el CVC de seguridad."}
          </Text>
        </Animated.View>

        <Animated.View entering={sectionEnter(330)} className="flex-row gap-3">
          <InfoTile label="Titular" value={selectedCard.name} />
          <InfoTile label="Numero" value={`**** ${selectedCard.lastDigits}`} />
        </Animated.View>

        <Animated.View entering={sectionEnter(390)} className="flex-row gap-3">
          <InfoTile label="Red" value={selectedCard.network} />
          <InfoTile label="Tipo" value={selectedCard.status} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
