import { router } from "expo-router";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { CreditCard, Home, Percent, Repeat2, User } from "lucide-react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type FinanceTab = {
  href: string;
  icon: ComponentType<any>;
  key: FinanceTabKey;
  label: string;
};

export type FinanceTabKey = "home" | "movements" | "cards" | "assets" | "profile";

type FinanceBottomTabsProps = {
  activeTab: FinanceTabKey;
};

const tabs: FinanceTab[] = [
  { href: "/home", icon: Home, key: "home", label: "Inicio" },
  { href: "/movements", icon: Repeat2, key: "movements", label: "Mov." },
  { href: "/cards", icon: CreditCard, key: "cards", label: "Tarjetas" },
  { href: "/assets", icon: Percent, key: "assets", label: "Activos" },
  { href: "/dashboard", icon: User, key: "profile", label: "Perfil" },
];

export function FinanceBottomTabs({ activeTab }: FinanceBottomTabsProps) {
  const { theme } = useAppTheme();

  return (
    <Animated.View
      className="absolute bottom-5 left-5 right-5 h-[76px] flex-row items-center rounded-[28px] border px-2"
      entering={FadeInDown.duration(560).delay(220).easing(Easing.out(Easing.quad))}
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderCurve: "continuous",
        boxShadow: "0 16px 38px rgba(7, 17, 31, 0.18)",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        const color = isActive ? theme.primary : theme.mutedText;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className="flex-1 items-center justify-center gap-1"
            key={tab.key}
            onPress={() => {
              selectionHaptic();
              router.navigate(tab.href as never);
            }}
          >
            <View
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: isActive ? theme.primarySoft : "transparent" }}
            >
              <Icon color={color} size={20} strokeWidth={isActive ? 2.8 : 2.2} />
            </View>
            <Text className="text-[10px] font-semibold" numberOfLines={1} style={{ color }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}
