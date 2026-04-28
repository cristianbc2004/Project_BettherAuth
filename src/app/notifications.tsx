import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { useAppTheme } from "@/shared/lib/theme-context";

type NotificationItem = {
  accent: string;
  iconAccent: string;
  id: string;
  title: string;
  timestamp: string;
  unread?: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "account-security",
    title: "New sign-in detected",
    timestamp: "Today | 03:23 AM",
    accent: "#40245f",
    iconAccent: "#f47ca8",
    unread: true,
  },
  {
    id: "password-updated",
    title: "Password updated",
    timestamp: "Tuesday | 05:23 PM",
    accent: "#1f3640",
    iconAccent: "#67dbc8",
  },
  {
    id: "two-factor-enabled",
    title: "Two-factor enabled",
    timestamp: "Friday | 05:00 PM",
    accent: "#2e2950",
    iconAccent: "#8d7cff",
  },
  {
    id: "admin-review",
    title: "Admin review available",
    timestamp: "12 Dec 2024 | 04:00 PM",
    accent: "#42311f",
    iconAccent: "#f0b245",
  },
  {
    id: "language-updated",
    title: "Language preference saved",
    timestamp: "02 Dec 2024 | 02:00 PM",
    accent: "#203946",
    iconAccent: "#4dc4ff",
  },
];

function NotificationRow({ accent, iconAccent, timestamp, title, unread }: NotificationItem) {
  const { theme } = useAppTheme();

  return (
    <Pressable className="flex-row items-center px-2 py-5">
      <View
        className="mr-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: accent }}
      >
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: iconAccent }}
        >
          <View className="h-2.5 w-2.5 rounded-full bg-white/90" />
        </View>
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
        <View className="mb-8 flex-row items-center justify-between">
          <AppBackButton fallbackHref={"/home" as never} />

          <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>Notifications</Text>

          <View
            className="h-11 w-11 items-center justify-center rounded-full border"
            style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}
          >
            <Text className="text-xs font-semibold uppercase tracking-[1.1px]" style={{ color: theme.text }}>5 new</Text>
          </View>
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
