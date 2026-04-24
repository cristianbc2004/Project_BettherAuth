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

export function LoadingScreen() {
  const { t } = useTranslation();
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
    <SafeAreaView className="flex-1 bg-midnight-950">
      <View className="absolute inset-0">
        <View className="absolute inset-0 bg-[#080c18]" />
        <View className="absolute top-0 h-[260px] w-full bg-[#2a1a52]/5" />
        <View className="absolute right-[-48px] top-[-20px] h-56 w-56 rounded-full bg-[#6d34d8]/10" />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-[320px] rounded-[30px] border border-white/6 bg-[#0b1220]/78 px-6 py-7">
          <View className="h-2 overflow-hidden rounded-full bg-white/10">
            <Animated.View
              className="h-full rounded-full bg-[#8d3dff]"
              style={progressStyle}
            >
              <Animated.View
                className="h-full w-20 bg-white/30"
                style={shimmerStyle}
              />
            </Animated.View>
          </View>
          <Text className="mt-5 text-center text-base font-semibold text-white">
            {t("common.loadingSession")}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-white/55">
            Better Auth Dashboard
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
