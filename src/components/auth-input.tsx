import { Text, TextInput, type TextInputProps, View } from "react-native";

type AuthInputProps = TextInputProps & {
  error?: string;
  label: string;
};

export function AuthInput({ error, label, ...props }: AuthInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-ink-800">{label}</Text>
      <TextInput
        className="rounded-2xl border border-ink-100 bg-ink-50 px-4 py-3 text-base text-ink-900"
        placeholderTextColor="#6f978d"
        {...props}
      />
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
