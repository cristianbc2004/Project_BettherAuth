import { useRef } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, Text } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AuthSubmitButtonProps = {
  isPending: boolean;
  label: string;
  onPress: () => void;
};

export function AuthSubmitButton({ isPending, label, onPress }: AuthSubmitButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      className="mt-4 h-14 items-center justify-center rounded-[26px] border border-[#ba7dff]/30 bg-[#8d3dff]"
      disabled={isPending}
      onPressIn={() => {
        animateScale(0.97);
      }}
      onPressOut={() => {
        animateScale(1);
      }}
      onPress={onPress}
      style={{ transform: [{ scale }] }}
    >
      {isPending ? (
        <ActivityIndicator color="#f8fafc" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </AnimatedPressable>
  );
}
