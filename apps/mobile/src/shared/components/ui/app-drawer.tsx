import { router } from "expo-router";
import { ChevronRight, Cookie, ShieldCheck, UserCircle, Users, X } from "lucide-react-native";
import { memo, useCallback, useRef } from "react";
import { Pressable, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/shared/components/ui/app-text";
import { selectionHaptic } from "@/shared/lib/haptics";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AppDrawerProps = {
  email: string;
  isAdmin: boolean;
  name: string;
  role: string;
};

type DrawerOption = {
  accessibilityLabel: string;
  description: string;
  href: string;
  icon: typeof Users;
  title: string;
};

type DrawerOptionRowProps = DrawerOption & {
  index: number;
  onPress: (href: string) => void;
};

const DrawerOptionRow = memo(function DrawerOptionRow({
  accessibilityLabel,
  description,
  href,
  icon: Icon,
  index,
  onPress,
  title,
}: DrawerOptionRowProps) {
  const { theme } = useAppTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(360)
        .delay(index * 70)
        .easing(Easing.out(Easing.quad))}
    >
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        className="flex-row items-center border-b py-4"
        onPress={() => onPress(href)}
        style={{ borderColor: theme.border }}
      >
        <View
          className="mr-4 h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.primarySoft }}
        >
          <Icon color={theme.primary} size={22} strokeWidth={2.2} />
        </View>

        <View className="flex-1 pr-3">
          <AppText className="text-[16px] font-bold">
            {title}
          </AppText>
          <AppText className="mt-1" tone="muted" variant="subtitle">
            {description}
          </AppText>
        </View>

        <ChevronRight color={theme.mutedText} size={22} strokeWidth={2.3} />
      </Pressable>
    </Animated.View>
  );
});

export function AppDrawer({
  email,
  isAdmin,
  name,
  role,
}: AppDrawerProps) {
  const { theme } = useAppTheme();
  const navigationLockRef = useRef(false);
  const drawerOptions: DrawerOption[] = [
    ...(isAdmin
      ? [
          {
            accessibilityLabel: "Open workers",
            description: "People, details, chart, and map.",
            href: "/person",
            icon: Users,
            title: "Workers",
          },
        ]
      : []),
    {
      accessibilityLabel: "Open cookie policy",
      description: "Technical cookies and preferences.",
      href: "/legal/cookies",
      icon: Cookie,
      title: "Cookie policy",
    },
    {
      accessibilityLabel: "Open privacy policy",
      description: "Data, sessions, and security.",
      href: "/legal/privacy",
      icon: ShieldCheck,
      title: "Privacy policy",
    },
  ];

  const handleNavigate = useCallback(
    (href: string) => {
      if (navigationLockRef.current) {
        return;
      }

      navigationLockRef.current = true;
      selectionHaptic();

      router.replace(href as never);
    },
    [],
  );
  const handleClose = useCallback(() => {
    selectionHaptic();
    backOrReplace("/home" as never);
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1 px-5 pb-10 pt-5">
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Open account"
            accessibilityRole="button"
            className="flex-1 flex-row items-center"
            onPress={() => handleNavigate("/dashboard")}
          >
            <View
              className="mr-4 h-16 w-16 items-center justify-center rounded-[22px] border"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <UserCircle color={theme.text} size={34} strokeWidth={2.1} />
            </View>
            <View className="flex-1">
              <AppText
                className="text-[20px] font-bold"
                numberOfLines={1}
              >
                {name}
              </AppText>
              <AppText className="mt-1 text-[14px] font-semibold" tone="muted">
                {role}
              </AppText>
              <AppText className="mt-1 text-xs" numberOfLines={1} tone="muted">
                {email}
              </AppText>
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel="Close menu"
            accessibilityRole="button"
            className="ml-4 h-11 w-11 items-center justify-center rounded-full"
            onPress={handleClose}
          >
            <X color={theme.text} size={22} strokeWidth={2.4} />
          </Pressable>
        </View>

        <View className="mb-6 h-px" style={{ backgroundColor: theme.border }} />

        <AppText className="mb-2 text-[18px] font-bold">
          Menu
        </AppText>

        <View>
          {drawerOptions.map((option, index) => (
            <DrawerOptionRow
              accessibilityLabel={option.accessibilityLabel}
              description={option.description}
              href={option.href}
              icon={option.icon}
              index={index}
              key={option.href}
              onPress={handleNavigate}
              title={option.title}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
