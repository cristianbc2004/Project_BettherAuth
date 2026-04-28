import { useEffect } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/shared/lib/theme-context";

export function LoadingScreen() {
  const { t } = useTranslation();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-[320px] rounded-[30px] border px-6 py-7" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
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
          <Text className="mt-5 text-center text-base font-semibold" style={{ color: theme.text }}>
            {t("common.loadingSession")}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5" style={{ color: theme.mutedText }}>
            Better Auth Dashboard
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
