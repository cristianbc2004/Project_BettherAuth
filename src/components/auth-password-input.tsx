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
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-ink-800">{label}</Text>
      <View className="flex-row items-center rounded-2xl border border-ink-100 bg-ink-50 px-4">
        <TextInput
          className="flex-1 py-3 text-base text-ink-900"
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={onBlur}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6f978d"
          secureTextEntry={!isVisible}
          value={value}
        />
        <Pressable
          className="ml-3 rounded-xl px-2 py-1"
          onPress={() => {
            setIsVisible((currentValue) => !currentValue);
          }}
        >
          <Text className="text-sm font-semibold text-coral-500">
            {isVisible ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      </View>
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
