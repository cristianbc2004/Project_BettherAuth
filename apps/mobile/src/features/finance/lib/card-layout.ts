export const CARD_PREVIEW_HORIZONTAL_PADDING = 40;
export const CARD_PREVIEW_MAX_WIDTH = 360;
export const CARD_STACK_HEIGHT = 188;
export const CARD_STACK_COLLAPSED_OFFSET = 82;
export const CARD_STACK_EXPANDED_GAP = 18;

const HOME_CARD_GAP = 16;
const HOME_CARD_MIN_VIEWPORT_WIDTH = 270;
const HOME_CARD_MIN_WIDTH = 220;
const HOME_CARD_MIN_HEIGHT = 196;
const HOME_CARD_MAX_HEIGHT = 214;
const HOME_CARD_ASPECT_RATIO = 0.64;
const HOME_CARD_MIN_PEEK = 36;
const HOME_CARD_MAX_PEEK = 52;
const HOME_CARD_PEEK_RATIO = 0.12;

export function getCardPreviewWidth(screenWidth: number) {
  return Math.min(screenWidth - CARD_PREVIEW_HORIZONTAL_PADDING, CARD_PREVIEW_MAX_WIDTH);
}

export function getCardStackLayout({
  cardsCount,
  contentBottomSpacing,
  isExpanded,
  screenHeight,
}: {
  cardsCount: number;
  contentBottomSpacing: number;
  isExpanded: boolean;
  screenHeight: number;
}) {
  const collapsedStackHeight =
    CARD_STACK_HEIGHT + Math.max(cardsCount - 1, 0) * CARD_STACK_COLLAPSED_OFFSET;
  const expandedStackHeight =
    cardsCount * CARD_STACK_HEIGHT + Math.max(cardsCount - 1, 0) * CARD_STACK_EXPANDED_GAP;
  const stackHeight = isExpanded ? expandedStackHeight : collapsedStackHeight;
  const animatedCardsBottomSpacing = Math.max(screenHeight - stackHeight - 120, contentBottomSpacing);

  return {
    animatedCardsBottomSpacing,
    collapsedStackHeight,
    expandedStackHeight,
    stackHeight,
  };
}

export function getHomeCardCarouselLayout(screenWidth: number) {
  const cardsViewportWidth = Math.max(screenWidth - CARD_PREVIEW_HORIZONTAL_PADDING, HOME_CARD_MIN_VIEWPORT_WIDTH);
  const nextCardPeek = Math.round(
    Math.min(Math.max(cardsViewportWidth * HOME_CARD_PEEK_RATIO, HOME_CARD_MIN_PEEK), HOME_CARD_MAX_PEEK),
  );
  const cardWidth = Math.max(Math.round(cardsViewportWidth - HOME_CARD_GAP - nextCardPeek), HOME_CARD_MIN_WIDTH);
  const cardHeight = Math.round(
    Math.min(Math.max(cardWidth * HOME_CARD_ASPECT_RATIO, HOME_CARD_MIN_HEIGHT), HOME_CARD_MAX_HEIGHT),
  );

  return {
    cardGap: HOME_CARD_GAP,
    cardHeight,
    cardSnapInterval: cardWidth + HOME_CARD_GAP,
    cardWidth,
    cardsViewportWidth,
    nextCardPeek,
  };
}
