import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Boxes, ChevronLeft, Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function CardsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { cards, isLoading, refreshCards } = useWalletCards();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const cardWidth = Math.min(width - 40, 360);
  const displayedCards = cards;
  const selectedCard = useMemo(
    () => displayedCards.find((card) => card.id === selectedCardId) ?? null,
    [displayedCards, selectedCardId],
  );

  useEffect(() => {
    if (session?.user.id) {
      void refreshCards();
    }
  }, [refreshCards, session?.user.id]);

  useEffect(() => {
    if (selectedCardId && !selectedCard) {
      setSelectedCardId(null);
    }
  }, [selectedCard, selectedCardId]);

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
        contentContainerClassName="px-5 pb-10 pt-8"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader
          rightSlot={
            <View className="flex-row items-center gap-3">
              <Pressable
                accessibilityLabel="Actualizar tarjetas"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-full"
                onPress={() => {
                  selectionHaptic();
                  void refreshCards();
                }}
                style={{ backgroundColor: theme.card }}
              >
                <Boxes color={theme.text} size={19} strokeWidth={2.4} />
              </Pressable>
              <Pressable
                accessibilityLabel="Anadir nueva tarjeta"
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-full"
                onPress={() => {
                  selectionHaptic();
                  router.push({ pathname: "/targets/add" } as never);
                }}
                style={{ backgroundColor: theme.card }}
              >
                <Plus color={theme.text} size={20} strokeWidth={2.6} />
              </Pressable>
            </View>
          }
          title="Cartera"
        />

        <View className="mt-6">
          {isLoading ? (
            <View
              className="h-[188px] items-center justify-center rounded-[30px]"
              style={{ backgroundColor: theme.card, width: cardWidth }}
            >
              <Text className="text-[15px] font-black" style={{ color: theme.mutedText }}>
                Cargando tarjetas...
              </Text>
            </View>
          ) : displayedCards.length === 0 ? (
            <View
              className="h-[188px] items-center justify-center rounded-[30px] border border-dashed px-6"
              style={{ backgroundColor: theme.card, borderColor: theme.border, width: cardWidth }}
            >
              <Text className="text-center text-[17px] font-black" style={{ color: theme.text }}>
                No hay tarjetas guardadas
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-5" style={{ color: theme.mutedText }}>
                Anade tu primera tarjeta para verla aqui.
              </Text>
            </View>
          ) : selectedCard ? (
            <View className="items-center">
              <View className="mb-4 w-full flex-row items-center">
                <Pressable
                  accessibilityLabel="Volver a todas las tarjetas"
                  accessibilityRole="button"
                  className="flex-row items-center gap-2 rounded-full px-3 py-2"
                  onPress={() => {
                    selectionHaptic();
                    setSelectedCardId(null);
                  }}
                  style={{ backgroundColor: theme.card }}
                >
                  <ChevronLeft color={theme.text} size={18} strokeWidth={2.4} />
                  <Text className="text-[13px] font-black" style={{ color: theme.text }}>
                    Todas
                  </Text>
                </Pressable>
              </View>

              <WalletCardPreview card={selectedCard} width={cardWidth} />
              <Pressable
                accessibilityLabel={`Gestionar tarjeta terminada en ${selectedCard.lastDigits}`}
                accessibilityRole="button"
                className="mt-4 rounded-full px-5 py-2.5"
                onPress={() => {
                  selectionHaptic();
                  router.push({
                    params: { cardId: selectedCard.id },
                    pathname: "/targets/details",
                  } as never);
                }}
                style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}
              >
                <Text className="text-[14px] font-black" style={{ color: theme.text }}>
                  Gestionar
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text className="mb-3 text-[12px] font-black uppercase tracking-[1.8px]" style={{ color: theme.primary }}>
                Tus tarjetas
              </Text>
              <View className="gap-4">
                {displayedCards.map((card) => (
                  <Pressable
                    key={card.id}
                    accessibilityLabel={`Abrir tarjeta terminada en ${card.lastDigits}`}
                    accessibilityRole="button"
                    onPress={() => {
                      selectionHaptic();
                      setSelectedCardId(card.id);
                    }}
                  >
                    <WalletCardPreview card={card} width={cardWidth} />
                  </Pressable>
                ))}
              </View>
              
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
