import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, Text, View } from "react-native";

type AdminActionRowProps = {
  accent: string;
  description: string;
  eyebrow: string;
  icon?: ImageSourcePropType;
  onPress: () => void;
  title: string;
};

export function AdminActionRow({
  accent,
  description,
  eyebrow,
  icon,
  onPress,
  title,
}: AdminActionRowProps) {
  return (
    <Pressable
      className="flex-row items-center px-2 py-5"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        className="mr-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: accent }}
      >
        {icon ? (
          <Image
            className="h-6 w-6"
            resizeMode="contain"
            source={icon}
            style={{ tintColor: "rgba(255, 255, 255, 0.95)" }}
          />
        ) : (
          <View className="h-3 w-3 rounded-full bg-white/85" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.4px] text-white/55">
          {eyebrow}
        </Text>
        <Text className="mt-1 text-[17px] font-semibold text-white">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-white/55">{description}</Text>
      </View>

      <Text className="ml-3 text-2xl text-white/45">{">"}</Text>
    </Pressable>
  );
}
