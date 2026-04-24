import { useEffect, useState } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AuthInputProps = TextInputProps & {
  error?: string;
  label: string;
};

export function AuthInput({ error, label, onBlur, onFocus, ...props }: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputState = useSharedValue(0);

  useEffect(() => {
    inputState.value = withTiming(error ? 2 : isFocused ? 1 : 0, {
      duration: 180,
    });
  }, [error, inputState, isFocused]);

  const inputContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(inputState.value, [0, 1, 2], [
      "rgba(255, 255, 255, 0.06)",
      "rgba(141, 61, 255, 0.12)",
      "rgba(239, 68, 68, 0.1)",
    ]),
    borderColor: interpolateColor(inputState.value, [0, 1, 2], [
      "rgba(255, 255, 255, 0.05)",
      "rgba(168, 120, 255, 0.65)",
      "rgba(248, 113, 113, 0.6)",
    ]),
    transform: [{ scale: interpolate(inputState.value, [0, 1, 2], [1, 1.01, 1]) }],
  }));

  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-medium text-white/90">
        {label}
      </Text>
      <Animated.View className="rounded-[22px] border px-5" style={inputContainerStyle}>
        <TextInput
          className="py-4 text-base text-white"
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor="rgba(255,255,255,0.38)"
          {...props}
        />
      </Animated.View>
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
