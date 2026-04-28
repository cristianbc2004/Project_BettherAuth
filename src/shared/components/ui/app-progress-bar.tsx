import { useEffect } from "react";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

export function AppProgressBar() {
  const { theme } = useAppTheme();
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1600,
      easing: Easing.out(Easing.cubic),
    });

    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(shimmer);
    };
  }, [progress, shimmer]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 0.72, 1], [12, 78, 92])}%`,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.55,
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-80, 260]) }],
  }));

  return (
    <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.inputBackground }}>
      <Animated.View
        className="h-full rounded-full"
        style={[progressStyle, { backgroundColor: theme.primary }]}
      >
        <Animated.View
          className="h-full w-20"
          style={[shimmerStyle, { backgroundColor: theme.textOnPrimary }]}
        />
      </Animated.View>
    </View>
  );
}
