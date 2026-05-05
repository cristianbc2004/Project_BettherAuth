import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Eye, LockKeyhole, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CardNetworkBadge } from "@/features/finance/components/card-network-badge";
import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import { type WalletCard } from "@/features/finance/mocks";
import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const ACTIVE_CARD_HEIGHT = 188;
const PREVIEW_CARD_HEIGHT = 74;
const STACK_STEP = 34;
const cardActions = [
  { icon: Eye, label: "Ver PIN" },
  { icon: LockKeyhole, label: "Bloquear" },
] as const;

function CompactStackCard({
  card,
  isTopPreview,
  width,
}: {
  card: WalletCard;
  isTopPreview: boolean;
  width: number;
}) {
  return (
    <LinearGradient
      className="overflow-hidden rounded-[26px] px-5 py-4"
      colors={card.gradient}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={{
        borderCurve: "continuous",
        height: PREVIEW_CARD_HEIGHT,
        width,
      }}
    >
      <View
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full"
        style={{ backgroundColor: `${card.textColor}${isTopPreview ? "22" : "14"}` }}
      />
      <View
        className="absolute -bottom-10 left-8 h-24 w-24 rounded-full"
        style={{ backgroundColor: `${card.textColor}${isTopPreview ? "16" : "10"}` }}
      />

      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="text-[11px] font-black uppercase tracking-[1.8px]"
            numberOfLines={1}
            style={{ color: `${card.textColor}cc` }}
          >
            {card.status}
          </Text>
          <Text className="mt-1 text-[15px] font-black" numberOfLines={1} style={{ color: card.textColor }}>
            {card.balance}
          </Text>
        </View>

        <View className="items-end">
          <CardNetworkBadge color={card.textColor} compact={true} network={card.network} />
          <Text className="mt-1 text-[13px] font-black" style={{ color: card.textColor }}>
            **** {card.lastDigits}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export default function CardsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const { cards, isLoading, refreshCards } = useWalletCards();
  const cardWidth = Math.min(width - 40, 360);
  const [orderedCards, setOrderedCards] = useState<WalletCard[]>(cards);
  const syncedOrderedCards = orderedCards.filter((card) => cards.some((currentCard) => currentCard.id === card.id));
  const missingCards = cards.filter((card) => !syncedOrderedCards.some((currentCard) => currentCard.id === card.id));
  const displayedCards = [...missingCards, ...syncedOrderedCards];
  const activeCard = displayedCards[0];
  const stackCards = displayedCards.slice(1);
  const stackHeight =
    stackCards.length > 0 ? PREVIEW_CARD_HEIGHT + Math.max(stackCards.length - 1, 0) * STACK_STEP + 12 : 0;

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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="flex-1 px-5 pt-8">
        <View>
          <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
            Wallet
          </Text>
          <View className="mt-3 flex-row items-start justify-between gap-4">
            <Text className="flex-1 text-[34px] font-black leading-10" style={{ color: theme.text }}>
              Tarjetas
            </Text>
            <Pressable
              accessibilityLabel="Anadir nueva tarjeta"
              accessibilityRole="button"
              className="flex-row items-center rounded-full px-4 py-3"
              onPress={() => {
                selectionHaptic();
                router.push({ pathname: "/targets/add" } as never);
              }}
              style={{ backgroundColor: theme.primarySoft }}
            >
              <Plus color={theme.primary} size={18} strokeWidth={2.4} />
              <Text className="ml-2 text-[14px] font-black" style={{ color: theme.primary }}>
                Anadir
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-10">
          {isLoading ? (
            <View
              className="h-[188px] items-center justify-center rounded-[30px]"
              style={{ backgroundColor: theme.card, width: cardWidth }}
            >
              <Text className="text-[15px] font-black" style={{ color: theme.mutedText }}>
                Cargando targets...
              </Text>
            </View>
          ) : activeCard ? (
            <Animated.View layout={LinearTransition.springify().damping(24).stiffness(220)}>
              <WalletCardPreview card={activeCard} width={cardWidth} />
            </Animated.View>
          ) : (
            <View
              className="h-[188px] items-center justify-center rounded-[30px] border border-dashed px-6"
              style={{ backgroundColor: theme.card, borderColor: theme.border, width: cardWidth }}
            >
              <Text className="text-center text-[17px] font-black" style={{ color: theme.text }}>
                No hay targets guardados
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-5" style={{ color: theme.mutedText }}>
                Anade tu primer target para verlo aqui.
              </Text>
            </View>
          )}

          <View className="mt-5 flex-row gap-3">
            {cardActions.map((action) => {
              const Icon = action.icon;

              return (
                <Pressable
                  accessibilityLabel={action.label}
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-[20px] px-4 py-4"
                  key={action.label}
                  onPress={selectionHaptic}
                  style={{ backgroundColor: theme.card }}
                >
                  <View
                    className="mr-3 h-10 w-10 items-center justify-center rounded-[14px]"
                    style={{ backgroundColor: theme.backgroundMuted }}
                  >
                    <Icon color={theme.text} size={20} strokeWidth={2.3} />
                  </View>
                  <Text className="text-[15px] font-black" style={{ color: theme.text }}>
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-1 justify-end pb-6">
          <View style={{ height: stackHeight }}>
            {stackCards
              .slice()
              .reverse()
              .map((card, reverseIndex) => {
                const index = stackCards.length - 1 - reverseIndex;
                const topOffset = index * STACK_STEP;

                return (
                  <Animated.View
                    key={card.id}
                    layout={LinearTransition.springify().damping(24).stiffness(220)}
                    style={{
                      left: 0,
                      position: "absolute",
                      right: 0,
                      top: topOffset,
                      zIndex: index,
                    }}
                  >
                    <Pressable
                      accessibilityLabel={`${card.network} terminada en ${card.lastDigits}`}
                      accessibilityRole="button"
                      onPress={() => {
                        selectionHaptic();
                        setOrderedCards((currentCards) => {
                          const selectedCard = currentCards.find((item) => item.id === card.id);

                          if (!selectedCard) {
                            return currentCards;
                          }

                          return [selectedCard, ...currentCards.filter((item) => item.id !== card.id)];
                        });
                      }}
                    >
                      <CompactStackCard card={card} isTopPreview={index === 0} width={cardWidth} />
                    </Pressable>
                  </Animated.View>
                );
              })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
