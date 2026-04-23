import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { selectionHaptic } from "@/shared/lib/haptics";

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
        <Text className="text-[17px] font-semibold text-white">{title}</Text>
        <Text className="mt-1 text-sm text-white/55">{timestamp}</Text>
      </View>

      {unread ? <View className="ml-3 h-3 w-3 rounded-full bg-[#8f64ff]" /> : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const rowAnimations = useRef(
    notifications.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(18),
    })),
  ).current;

  useEffect(() => {
    Animated.stagger(
      120,
      rowAnimations.map((row) =>
        Animated.parallel([
          Animated.timing(row.opacity, {
            toValue: 1,
            duration: 460,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(row.translateY, {
            toValue: 0,
            duration: 460,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    ).start();
  }, [rowAnimations]);

  return (
    <SafeAreaView className="flex-1 bg-[#060c17]">
      <View className="absolute inset-0">
        <View className="absolute inset-0 bg-[#060c17]" />
        <View className="absolute inset-x-0 top-0 h-[220px] bg-[#33156d]/16" />
        <View className="absolute right-[-10] top-0 h-56 w-56 rounded-full bg-[#6f35df]/10" />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
            onPress={() => {
              selectionHaptic();
              router.back();
            }}
          >
            <Text className="text-2xl text-white/80">{"<"}</Text>
          </Pressable>

          <Text className="text-[24px] font-semibold text-white">Notifications</Text>

          <View className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Text className="text-xs font-semibold uppercase tracking-[1.1px] text-white/78">5 new</Text>
          </View>
        </View>

        <Text className="mb-4 px-1 text-xs font-medium uppercase tracking-[1.5px] text-white/70">
          Latest activity
        </Text>

        <View className="overflow-hidden rounded-[28px] border border-white/5 bg-transparent">
          {notifications.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: rowAnimations[index].opacity,
                transform: [{ translateY: rowAnimations[index].translateY }],
              }}
            >
              <NotificationRow {...item} />
              {index < notifications.length - 1 ? (
                <View className="mx-2 h-px bg-white/8" />
              ) : null}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
