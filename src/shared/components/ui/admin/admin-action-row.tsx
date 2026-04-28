import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

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
  const { theme } = useAppTheme();

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
            style={{ tintColor: theme.textOnPrimary }}
          />
        ) : (
          <View className="h-3 w-3 rounded-full bg-white/85" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.4px]" style={{ color: theme.mutedText }}>
          {eyebrow}
        </Text>
        <Text className="mt-1 text-[17px] font-semibold" style={{ color: theme.text }}>{title}</Text>
        <Text className="mt-1 text-sm leading-5" style={{ color: theme.mutedText }}>{description}</Text>
      </View>

      <Text className="ml-3 text-2xl" style={{ color: theme.mutedText }}>{">"}</Text>
    </Pressable>
  );
}
