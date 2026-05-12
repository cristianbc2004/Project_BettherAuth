import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

type AdminActionRowProps = {
  accent: string;
  description: string;
  eyebrow: string;
  icon?: LucideIcon;
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
  const Icon = icon;

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
        {Icon ? (
          <Icon color={theme.textOnPrimary} size={22} strokeWidth={2.4} />
        ) : (
          <View className="h-3 w-3 rounded-full bg-white/85" />
        )}
      </View>

      <View className="flex-1">
        <AppText className="text-[11px] font-semibold uppercase tracking-[1.4px]" style={{ color: theme.mutedText }}>
          {eyebrow}
        </AppText>
        <AppText className="mt-1 text-[17px] font-semibold" style={{ color: theme.text }}>{title}</AppText>
        <AppText className="mt-1 text-sm leading-5" style={{ color: theme.mutedText }}>{description}</AppText>
      </View>

      <ChevronRight color={theme.mutedText} size={22} strokeWidth={2.2} />
    </Pressable>
  );
}
