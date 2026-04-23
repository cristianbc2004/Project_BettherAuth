import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme";

type AuthPasswordInputProps = {
  error?: string;
  label: string;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export function AuthPasswordInput({
  error,
  label,
  onBlur,
  onChangeText,
  placeholder,
  value,
}: AuthPasswordInputProps) {
  const { colorScheme, theme } = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);
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
      <Animated.View className="flex-row items-center rounded-[22px] border px-5" style={inputContainerStyle}>
        <TextInput
          className="flex-1 py-4 text-base"
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onChangeText={onChangeText}
          onFocus={() => {
            setIsFocused(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === "light" ? "rgba(31,25,43,0.38)" : "rgba(255,255,255,0.38)"}
          secureTextEntry={!isVisible}
          style={{ color: theme.text }}
          value={value}
        />
        <Pressable
          className="ml-3 rounded-full px-2 py-2"
          onPress={() => {
            setIsVisible((currentValue) => !currentValue);
          }}
        >
          <Text className="text-xs font-medium" style={{ color: theme.mutedText }}>
            {isVisible ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </Animated.View>
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
