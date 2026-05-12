import { Redirect, router } from "expo-router";
import { memo, useCallback, useEffect, useMemo } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Boxes, Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import type { WalletCard } from "@/shared/types/finance";

type AnimatedWalletCardItemProps = {
  card: WalletCard;
  cardWidth: number;
  index: number;
  onPress: (cardId: string) => void;
  scrollY: SharedValue<number>;
  snapInterval: number;
};

const CARD_HEIGHT = 188;
const CARD_STACK_OVERLAP = 58;
const CARD_STACK_STEP = CARD_HEIGHT - CARD_STACK_OVERLAP;
const CARD_SWIPE_THRESHOLD = 86;
const CARD_SWIPE_MAX_TRANSLATION = 116;

const AnimatedWalletCardItem = memo(function AnimatedWalletCardItem({
  card,
  cardWidth,
  index,
  onPress,
  scrollY,
  snapInterval,
}: AnimatedWalletCardItemProps) {
  const swipeX = useSharedValue(0);
  const animatedCardStyle = useAnimatedStyle(() => {
    const cardCenter = index * snapInterval;
    const inputRange = [cardCenter - snapInterval, cardCenter, cardCenter + snapInterval];

    return {
      transform: [
        {
          translateX: swipeX.value,
        },
        {
          translateY: interpolate(scrollY.value, inputRange, [20, 0, 20], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, inputRange, [0.93, 1, 0.93], Extrapolation.CLAMP),
        },
      ],
    };
  }, [index, snapInterval]);
  const manageGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(24)
        .failOffsetY([-18, 18])
        .onUpdate((event) => {
          swipeX.value = Math.min(Math.max(event.translationX, 0), CARD_SWIPE_MAX_TRANSLATION);
        })
        .onEnd((event) => {
          if (event.translationX > CARD_SWIPE_THRESHOLD || event.velocityX > 900) {
            runOnJS(onPress)(card.id);
          }

          swipeX.value = withSpring(0, { damping: 16, stiffness: 190 });
        })
        .onFinalize(() => {
          swipeX.value = withSpring(0, { damping: 16, stiffness: 190 });
        }),
    [card.id, onPress, swipeX],
  );

  return (
    <GestureDetector gesture={manageGesture}>
      <Animated.View style={animatedCardStyle}>
        <View
          accessibilityHint="Desliza hacia la derecha para gestionar esta tarjeta"
          accessibilityLabel={`Tarjeta terminada en ${card.lastDigits}`}
        >
          <WalletCardPreview card={card} width={cardWidth} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

export default function CardsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { contentBottomSpacing } = useFloatingTabBarMetrics();
  const { height, width } = useWindowDimensions();
  const { cards, isLoading, refreshCards } = useWalletCards();
  const cardWidth = Math.min(width - 40, 360);
  const cardSnapInterval = CARD_STACK_STEP;
  const animatedCardsBottomSpacing = Math.max(height - CARD_HEIGHT - 120, contentBottomSpacing);
  const cardsScrollY = useSharedValue(0);
  const displayedCards = cards;
  const handleCardPress = useCallback((cardId: string) => {
    selectionHaptic();
    router.push({
      params: { cardId },
      pathname: "/targets/details",
    } as never);
  }, []);
  const handleCardsScroll = useAnimatedScrollHandler((event) => {
    cardsScrollY.value = event.contentOffset.y;
  });
  const renderAnimatedCard = useCallback(
    (card: WalletCard, index: number) => (
      <AnimatedWalletCardItem
        card={card}
        cardWidth={cardWidth}
        index={index}
        onPress={handleCardPress}
        scrollY={cardsScrollY}
        snapInterval={cardSnapInterval}
      />
    ),
    [cardSnapInterval, cardWidth, cardsScrollY, handleCardPress],
  );

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

      <Animated.ScrollView
        bounces={false}
        contentContainerClassName="px-5 pt-5"
        contentContainerStyle={{
          paddingBottom: isLoading || displayedCards.length === 0 ? contentBottomSpacing : animatedCardsBottomSpacing,
        }}
        contentInsetAdjustmentBehavior="automatic"
        onScroll={handleCardsScroll}
        scrollEventThrottle={16}
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
        />

        <View className="mt-3">
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
          ) : (
            <View className="items-center">
              {displayedCards.map((card, index) => (
                <View key={card.id} style={{ marginTop: index === 0 ? 0 : -CARD_STACK_OVERLAP }}>
                  {renderAnimatedCard(card, index)}
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
