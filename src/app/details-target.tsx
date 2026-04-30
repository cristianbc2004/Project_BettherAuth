import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { type WalletCard, walletCards } from "@/features/finance/mocks";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const mockPins: Record<string, string> = {
  digital: "0927",
  savings: "7741",
  travel: "1284",
  "visa-primary": "4832",
};

type ActionButtonProps = {
  icon: typeof Eye;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
};

function ActionButton({ icon: Icon, label, onPress, tone = "default" }: ActionButtonProps) {
  const { theme } = useAppTheme();
  const isDanger = tone === "danger";

  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" className="flex-1 px-2 py-2" onPress={onPress}>
      <View
        className="h-12 w-12 items-center justify-center rounded-[16px]"
        style={{ backgroundColor: isDanger ? `${theme.danger}18` : theme.backgroundMuted }}
      >
        <Icon color={isDanger ? theme.danger : theme.text} size={21} strokeWidth={2.3} />
      </View>

      <Text className="mt-4 text-[16px] font-black" style={{ color: isDanger ? theme.danger : theme.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      className="flex-1 rounded-[22px] border px-4 py-4"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
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
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const resolvedCardId = Array.isArray(cardId) ? cardId[0] : cardId;
  const selectedCard = useMemo<WalletCard>(
    () => walletCards.find((card) => card.id === resolvedCardId) ?? walletCards[0],
    [resolvedCardId],
  );
  const cardWidth = Math.min(width - 40, 360);
  const displayedPin = isPinVisible ? (mockPins[selectedCard.id] ?? "0000") : "****";

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <ScrollView
        bounces={false}
        contentContainerClassName="gap-6 px-5 pb-12 pt-5"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full"
            onPress={() => {
              selectionHaptic();
              router.back();
            }}
            style={{ backgroundColor: theme.card }}
          >
            <ArrowLeft color={theme.text} size={22} strokeWidth={2.4} />
          </Pressable>

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
        </View>

        <View>
          <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
            Tarjeta
          </Text>
          <Text className="mt-3 text-[34px] font-black leading-10" style={{ color: theme.text }}>
            Detalle del target
          </Text>
          <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            Aqui puedes ver el PIN y gestionar el estado de tu tarjeta.
          </Text>
        </View>

        <View>
          <WalletCardPreview card={selectedCard} width={cardWidth} />
        </View>

        <View className="flex-row gap-3">
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
            label={isBlocked ? "Desbloquear" : "Bloquear"}
            onPress={() => {
              selectionHaptic();
              setIsBlocked((currentValue) => !currentValue);
            }}
            tone={isBlocked ? "default" : "danger"}
          />
        </View>

        <View className="px-2 py-2">
          <Text className="text-[12px] font-black uppercase tracking-[1.8px]" style={{ color: theme.mutedText }}>
            PIN
          </Text>
          <Text
            className="mt-3 text-[38px] font-black tracking-[8px]"
            style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
          >
            {displayedPin}
          </Text>
          <Text className="mt-3 text-[14px] leading-6" style={{ color: theme.mutedText }}>
            {isPinVisible
              ? "No compartas este codigo con nadie."
              : "Pulsa en Ver PIN para mostrar el codigo de seguridad."}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <InfoTile label="Titular" value={selectedCard.name} />
          <InfoTile label="Terminacion" value={`**** ${selectedCard.lastDigits}`} />
        </View>

        <View className="flex-row gap-3">
          <InfoTile label="Red" value={selectedCard.network} />
          <InfoTile label="Tipo" value={selectedCard.status} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
