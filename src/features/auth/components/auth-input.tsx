import { useEffect, useRef, useState } from "react";
import { Animated, Text, TextInput, type TextInputProps, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme";

type AuthInputProps = TextInputProps & {
  error?: string;
  label: string;
};

export function AuthInput({ error, label, onBlur, onFocus, ...props }: AuthInputProps) {
  const { colorScheme, theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputState = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(inputState, {
      toValue: error ? 2 : isFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [error, inputState, isFocused]);

  const inputContainerStyle = {
    backgroundColor: inputState.interpolate({
      inputRange: [0, 1, 2],
      outputRange:
        colorScheme === "light"
          ? ["rgba(91, 63, 142, 0.08)", "rgba(141, 61, 255, 0.12)", "rgba(239, 68, 68, 0.1)"]
          : ["rgba(255, 255, 255, 0.06)", "rgba(141, 61, 255, 0.12)", "rgba(239, 68, 68, 0.1)"],
    }),
    borderColor: inputState.interpolate({
      inputRange: [0, 1, 2],
      outputRange:
        colorScheme === "light"
          ? ["rgba(91, 63, 142, 0.12)", "rgba(122, 53, 232, 0.55)", "rgba(248, 113, 113, 0.6)"]
          : ["rgba(255, 255, 255, 0.05)", "rgba(168, 120, 255, 0.65)", "rgba(248, 113, 113, 0.6)"],
    }),
    transform: [
      {
        scale: inputState.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [1, 1.01, 1],
        }),
      },
    ],
  };

  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-medium" style={{ color: theme.text }}>
        {label}
      </Text>
      <Animated.View className="rounded-[22px] border px-5" style={inputContainerStyle}>
        <TextInput
          className="py-4 text-base"
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colorScheme === "light" ? "rgba(31,25,43,0.38)" : "rgba(255,255,255,0.38)"}
          style={{ color: theme.text }}
          {...props}
        />
      </Animated.View>
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
