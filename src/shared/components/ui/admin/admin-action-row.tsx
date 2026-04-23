import { Pressable, Text, View } from "react-native";

type AdminActionRowProps = {
  accent: string;
  description: string;
  eyebrow: string;
  onPress: () => void;
  title: string;
};

export function AdminActionRow({
  accent,
  description,
  eyebrow,
  onPress,
  title,
}: AdminActionRowProps) {
  return (
    <Pressable
      className="rounded-[28px] border border-white/10 bg-white/[0.06] px-4 py-4"
      onPress={onPress}
    >
      <View className="flex-row items-start">
        <View
          className="mr-4 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: accent }}
        >
          <View className="h-3 w-3 rounded-full bg-white/85" />
        </View>

        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.4px] text-white/65">
            {eyebrow}
          </Text>
          <Text className="mt-1 text-[18px] font-semibold text-white">{title}</Text>
          <Text className="mt-2 text-sm leading-5 text-white/70">{description}</Text>
        </View>

        <Text className="ml-3 text-2xl text-white/55">{">"}</Text>
      </View>
    </Pressable>
  );
}
