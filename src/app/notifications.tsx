import type { ComponentType } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Apple, ArrowRightLeft, BadgeCheck, RefreshCcw, ShieldCheck } from "lucide-react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { useAppTheme } from "@/shared/lib/theme-context";

type NotificationItem = {
  accent: string;
  icon: ComponentType<any>;
  iconAccent: string;
  id: string;
  title: string;
  timestamp: string;
  unread?: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "Apple payment",
    icon: Apple,
    title: "Apple payment",
    timestamp: "Today | 03:23 AM",
    accent: "#40245f",
    iconAccent: "#f47ca8",
    unread: true,
  },
  {
    id: "new transaction",
    icon: ArrowRightLeft,
    title: "new transaction",
    timestamp: "Tuesday | 05:23 PM",
    accent: "#1f3640",
    iconAccent: "#67dbc8",
  },
  {
    id: "two-factor-enabled",
    icon: ShieldCheck,
    title: "Two-factor enabled",
    timestamp: "Friday | 05:00 PM",
    accent: "#2e2950",
    iconAccent: "#8d7cff",
  },
  {
    id: "subscription renewal",
    icon: RefreshCcw,
    title: "subscription renewal",
    timestamp: "12 Dec 2024 | 04:00 PM",
    accent: "#42311f",
    iconAccent: "#f0b245",
  },
  {
    id: "accepted payment",
    icon: BadgeCheck,
    title: "accepted payment",
    timestamp: "02 Dec 2024 | 02:00 PM",
    accent: "#203946",
    iconAccent: "#4dc4ff",
  },
];

function NotificationRow({ accent, icon, iconAccent, timestamp, title, unread }: NotificationItem) {
  const { theme } = useAppTheme();
  const Icon = icon;

  return (
    <Pressable className="flex-row items-center px-2 py-5">
      <View
        className="mr-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: accent }}
      >
        <Icon color={iconAccent} size={22} strokeWidth={2.4} />
      </View>

      <View className="flex-1">
        <Text className="text-[17px] font-semibold" style={{ color: theme.text }}>{title}</Text>
        <Text className="mt-1 text-sm" style={{ color: theme.mutedText }}>{timestamp}</Text>
      </View>

      {unread ? <View className="ml-3 h-3 w-3 rounded-full" style={{ backgroundColor: theme.primary }} /> : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center">
          <AppBackButton fallbackHref={"/home" as never} />

          <View className="absolute left-0 right-0 items-center">
            <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>
              Notifications
            </Text>
          </View>

          <View className="ml-auto h-11 w-11" />
        </View>

        <Text className="mb-4 px-1 text-xs font-medium uppercase tracking-[1.5px]" style={{ color: theme.mutedText }}>
          Latest activity
        </Text>

        <View>
          {notifications.map((item, index) => (
            <Animated.View
              entering={FadeInDown.duration(460)
                .delay(index * 120)
                .easing(Easing.out(Easing.quad))}
              key={item.id}
            >
              <NotificationRow {...item} />
              {index < notifications.length - 1 ? (
                <View className="mx-2 h-px" style={{ backgroundColor: theme.border }} />
              ) : null}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
