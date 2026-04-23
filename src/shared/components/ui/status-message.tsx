import { Text, View } from "react-native";

type StatusMessageProps = {
  message: string;
  tone: "error" | "success";
};

export function StatusMessage({ message, tone }: StatusMessageProps) {
  const isSuccess = tone === "success";

  return (
    <View
      className={`rounded-[24px] border p-4 ${
        isSuccess ? "border-emerald-300/20 bg-emerald-500/10" : "border-red-300/20 bg-red-500/10"
      }`}
    >
      <Text className={`text-[15px] leading-6 ${isSuccess ? "text-emerald-50/88" : "text-red-50/88"}`}>
        {message}
      </Text>
    </View>
  );
}
