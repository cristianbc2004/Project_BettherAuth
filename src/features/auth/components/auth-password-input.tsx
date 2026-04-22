import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-medium text-white/90">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-[22px] border px-5 ${
          error ? "border-red-400/60 bg-red-500/10" : "border-white/5 bg-white/6"
        }`}
      >
        <TextInput
          className="flex-1 py-4 text-base text-white"
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={onBlur}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.38)"
          secureTextEntry={!isVisible}
          value={value}
        />
        <Pressable
          className="ml-3 rounded-full px-2 py-2"
          onPress={() => {
            setIsVisible((currentValue) => !currentValue);
          }}
        >
          <Text className="text-xs font-medium text-white/55">{isVisible ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
