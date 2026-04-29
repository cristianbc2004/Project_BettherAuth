import type { ReactNode } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type HeaderButtonProps = {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
};

type HomeHeaderProps = {
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
};

const homeIcons = {
  notifications: require("../../../../assets/notifications_blanco.png"),
};

function HeaderButton({ accessibilityLabel, children, onPress }: HeaderButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-12 w-12 items-center justify-center"
      hitSlop={10}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

function MenuGlyph() {
  const { theme } = useAppTheme();

  return (
    <View className="w-5 gap-1.5">
      <View className="h-0.5 rounded-full" style={{ backgroundColor: theme.text }} />
      <View className="h-0.5 rounded-full" style={{ backgroundColor: theme.text }} />
      <View className="h-0.5 rounded-full" style={{ backgroundColor: theme.text }} />
    </View>
  );
}

export function HomeHeader({ onOpenMenu, onOpenNotifications }: HomeHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between">
      <HeaderButton accessibilityLabel="Open menu" onPress={onOpenMenu}>
        <MenuGlyph />
      </HeaderButton>
      <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>
        Home
      </Text>
      <HeaderButton accessibilityLabel="Open notifications" onPress={onOpenNotifications}>
        <Image
          className="h-5 w-5"
          resizeMode="contain"
          source={homeIcons.notifications}
          style={{ tintColor: theme.text }}
        />
      </HeaderButton>
    </View>
  );
}
