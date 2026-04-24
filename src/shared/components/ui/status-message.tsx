import { Text, View } from "react-native";

type StatusMessageProps = {
  message: string;
  tone: "error" | "success";
};

export function StatusMessage({ message, tone }: StatusMessageProps) {
  const isSuccess = tone === "success";

  return (
    <View
      className={`rounded-[24px] border px-4 py-3 ${
        isSuccess ? "border-[#8d3dff]/45 bg-white/[0.07]" : "border-red-300/30 bg-red-500/15"
      }`}
    >
      <Text className={`text-[15px] font-medium leading-6 ${isSuccess ? "text-white" : "text-white"}`}>
        {message}
      </Text>
    </View>
  );
}
