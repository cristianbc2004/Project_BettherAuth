import { Text, TextInput, type TextInputProps, View } from "react-native";

type AuthInputProps = TextInputProps & {
  error?: string;
  label: string;
};

export function AuthInput({ error, label, ...props }: AuthInputProps) {
  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-medium text-white/90">
        {label}
      </Text>
      <TextInput
        className={`rounded-[22px] border px-5 py-4 text-base text-white ${
          error ? "border-red-400/60 bg-red-500/10" : "border-white/5 bg-white/6"
        }`}
        placeholderTextColor="rgba(255,255,255,0.38)"
        {...props}
      />
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
