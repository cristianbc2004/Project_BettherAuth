import { Redirect, router } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Boxes, Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { AppText } from "@/shared/components/ui/app-text";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import type { WalletCard } from "@repo/types/finance";

type AnimatedWalletCardItemProps = {
  card: WalletCard;
  cardWidth: number;
  cardsCount: number;
  index: number;
  isExpanded: boolean;
  onPress: (cardId: string) => void;
  onStackPress: () => void;
  stackProgress: SharedValue<number>;
};

const CARD_HEIGHT = 188;
const CARD_STACK_COLLAPSED_OFFSET = 82;
const CARD_STACK_EXPANDED_GAP = 18;

const AnimatedWalletCardItem = memo(function AnimatedWalletCardItem({
  card,
  cardWidth,
  cardsCount,
  index,
  isExpanded,
  onPress,
  onStackPress,
  stackProgress,
}: AnimatedWalletCardItemProps) {
  const animatedCardStyle = useAnimatedStyle(() => {
    const progress = stackProgress.value;
    const collapsedTranslateY = index * CARD_STACK_COLLAPSED_OFFSET;
    const expandedTranslateY = index * (CARD_HEIGHT + CARD_STACK_EXPANDED_GAP);

    return {
      transform: [
        {
          translateY: interpolate(progress, [0, 1], [collapsedTranslateY, expandedTranslateY]),
        },
      ],
      zIndex: cardsCount - index,
    };
  }, [cardsCount, index]);

  const handlePress = useCallback(() => {
    if (isExpanded || cardsCount <= 1) {
      onPress(card.id);
      return;
    }

    onStackPress();
  }, [card.id, cardsCount, isExpanded, onPress, onStackPress]);

  return (
    <Animated.View className="absolute left-0 top-0" style={animatedCardStyle}>
      <Pressable
        accessibilityLabel={`Card ending in ${card.lastDigits}`}
        accessibilityHint={isExpanded ? "Open this card's details" : "Expand the card stack"}
        accessibilityRole="button"
        onPress={handlePress}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.92 : 1 }}>
            <WalletCardPreview card={card} width={cardWidth} />
          </View>
        )}
      </Pressable>
    </Animated.View>
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
  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const stackProgress = useSharedValue(0);
  const displayedCards = cards;
  const collapsedStackHeight = CARD_HEIGHT + Math.max(displayedCards.length - 1, 0) * CARD_STACK_COLLAPSED_OFFSET;
  const expandedStackHeight =
    displayedCards.length * CARD_HEIGHT + Math.max(displayedCards.length - 1, 0) * CARD_STACK_EXPANDED_GAP;
  const stackHeight = isStackExpanded ? expandedStackHeight : collapsedStackHeight;
  const animatedCardsBottomSpacing = Math.max(height - stackHeight - 120, contentBottomSpacing);
  const animatedStackStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(stackProgress.value, [0, 1], [collapsedStackHeight, expandedStackHeight]),
    };
  }, [collapsedStackHeight, expandedStackHeight]);
  const handleStackPress = useCallback(() => {
    selectionHaptic();
    setIsStackExpanded(true);
    stackProgress.value = withSpring(1, { damping: 18, stiffness: 140 });
  }, [stackProgress]);
  const handleCardPress = useCallback((cardId: string) => {
    selectionHaptic();
    router.push({
      params: { cardId },
      pathname: "/targets/details",
    } as never);
  }, []);
  useEffect(() => {
    if (session?.user.id) {
      void refreshCards();
    }
  }, [refreshCards, session?.user.id]);

  useEffect(() => {
    if (displayedCards.length <= 1) {
      setIsStackExpanded(false);
      stackProgress.value = 0;
    }
  }, [displayedCards.length, stackProgress]);

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
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader
          title="Cards"
          rightSlot={
            <View className="flex-row items-center gap-3">
              <Pressable
                accessibilityLabel="Refresh cards"
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
                accessibilityLabel="Add new card"
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
              <AppText className="text-[15px] font-black" tone="muted">
                Loading cards...
              </AppText>
            </View>
          ) : displayedCards.length === 0 ? (
            <View
              className="h-[188px] items-center justify-center rounded-[30px] border border-dashed px-6"
              style={{ backgroundColor: theme.card, borderColor: theme.border, width: cardWidth }}
            >
              <AppText className="text-center text-[17px] font-black">
                No saved cards
              </AppText>
              <AppText className="mt-2 text-center" tone="muted" variant="subtitle">
                Add your first card to see it here.
              </AppText>
            </View>
          ) : (
            <View className="items-center">
              <Animated.View style={[{ width: cardWidth }, animatedStackStyle]}>
                {displayedCards.map((card, index) => (
                  <AnimatedWalletCardItem
                    card={card}
                    cardWidth={cardWidth}
                    cardsCount={displayedCards.length}
                    index={index}
                    isExpanded={isStackExpanded}
                    key={card.id}
                    onPress={handleCardPress}
                    onStackPress={handleStackPress}
                    stackProgress={stackProgress}
                  />
                ))}
              </Animated.View>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
