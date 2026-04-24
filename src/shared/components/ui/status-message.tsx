import { useEffect, useState } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type StatusMessageProps = {
  autoHideAfterMs?: number;
  message: string;
  tone: "error" | "success";
};

export function StatusMessage({ autoHideAfterMs, message, tone }: StatusMessageProps) {
  const isSuccess = tone === "success";
  const hideAfterMs = autoHideAfterMs ?? (isSuccess ? 3000 : undefined);
  const [isVisible, setIsVisible] = useState(true);
  const exitProgress = useSharedValue(0);

  useEffect(() => {
    setIsVisible(true);
    exitProgress.value = 0;

    if (!hideAfterMs) {
      return;
    }

    const timeoutId = setTimeout(() => {
      exitProgress.value = withTiming(
        1,
        {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(setIsVisible)(false);
          }
        },
      );
    }, hideAfterMs);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimation(exitProgress);
    };
  }, [exitProgress, hideAfterMs, message]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - exitProgress.value,
    transform: [{ translateY: -8 * exitProgress.value }],
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      className={`rounded-[24px] border px-4 py-3 ${
        isSuccess ? "border-emerald-400 bg-emerald-500" : "border-red-300/30 bg-red-500/15"
      }`}
      style={animatedStyle}
    >
      <Text className="text-[15px] font-medium leading-6 text-white">{message}</Text>
    </Animated.View>
  );
}
