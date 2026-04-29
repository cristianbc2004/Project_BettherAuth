import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Bell, Menu } from "lucide-react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type HeaderButtonProps = {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
};

type HomeHeaderProps = {
  canOpenMenu?: boolean;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
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

export function HomeHeader({ canOpenMenu = true, onOpenMenu, onOpenNotifications }: HomeHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between">
      {canOpenMenu ? (
        <HeaderButton accessibilityLabel="Open menu" onPress={onOpenMenu}>
          <Menu color={theme.text} size={30} strokeWidth={2.4} />
        </HeaderButton>
      ) : (
        <View className="h-12 w-12" />
      )}
      <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>
        Home
      </Text>
      <HeaderButton accessibilityLabel="Open notifications" onPress={onOpenNotifications}>
        <Bell color={theme.text} size={25} strokeWidth={2.1} />
      </HeaderButton>
    </View>
  );
}
