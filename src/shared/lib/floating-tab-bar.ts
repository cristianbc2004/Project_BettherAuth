import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FLOATING_TAB_BAR_HEIGHT = 72;
const MIN_FLOATING_TAB_BAR_BOTTOM_OFFSET = 16;
const FLOATING_TAB_BAR_BOTTOM_PADDING = 10;
const FLOATING_TAB_BAR_CONTENT_GAP = 16;

export function useFloatingTabBarMetrics() {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const bottomOffset = Math.max(
      insets.bottom + FLOATING_TAB_BAR_BOTTOM_PADDING,
      MIN_FLOATING_TAB_BAR_BOTTOM_OFFSET,
    );
    const contentBottomSpacing = bottomOffset + FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_CONTENT_GAP;

    return {
      bottomOffset,
      contentBottomSpacing,
    };
  }, [insets.bottom]);
}
