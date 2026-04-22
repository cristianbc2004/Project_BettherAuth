import { Text, View } from "react-native";

export function AuthBrandMark() {
  return (
    <View className="items-center">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#7d57c8]/10">
        <Text className="text-[28px] font-black tracking-[1px] text-[#b191ef]">BA</Text>
      </View>
      <Text className="mt-3 text-[26px] font-bold text-[#ab8ae6]">BetterAuth</Text>
    </View>
  );
}
