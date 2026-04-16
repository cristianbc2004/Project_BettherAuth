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
      className="mt-2 h-14 items-center justify-center rounded-2xl bg-ink-900"
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
        <ActivityIndicator color="#f6efe6" />
      ) : (
        <Text className="text-base font-bold text-sand">{label}</Text>
      )}
    </AnimatedPressable>
  );
}
