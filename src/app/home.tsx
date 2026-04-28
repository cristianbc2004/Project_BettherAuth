import { Redirect, router } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type DrawerOrganization = {
  id: string;
  name: string;
  units: string;
  featured?: boolean;
};

const drawerOrganizations: DrawerOrganization[] = [
  { id: "wdtech", name: "WDTECH", units: "10 unidades", featured: true },
  { id: "wdtechdeveloper", name: "Organizacion de wdtechdeveloper", units: "1 unidad" },
  { id: "testing", name: "Testing", units: "2 unidades" },
];

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "BA";
}

function HeaderButton({
  accessibilityLabel,
  children,
  onPress,
}: {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-12 w-12 items-center justify-center rounded-[18px] border"
      hitSlop={10}
      onPress={onPress}
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
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

function DrawerOrganizationRow({ featured, name, units }: DrawerOrganization) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center border-b py-5"
      onPress={selectionHaptic}
      style={{ borderColor: theme.border }}
    >
      <View
        className="mr-4 h-16 w-1.5 rounded-full"
        style={{ backgroundColor: featured ? theme.success : "transparent" }}
      />
      <View className="flex-1">
        <Text
          className="text-[18px] font-bold"
          style={{ color: featured ? theme.success : theme.text }}
        >
          {name}
        </Text>
        <View className="mt-2 flex-row items-center">
          <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: theme.success }} />
          <Text className="text-[15px]" style={{ color: theme.mutedText }}>
            {units}
          </Text>
        </View>
      </View>
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: featured ? theme.primarySoft : theme.backgroundMuted }}
      >
        <Text className="text-2xl font-semibold" style={{ color: theme.text }}>
          {">"}
        </Text>
      </View>
    </Pressable>
  );
}

function HomeDrawer({
  email,
  isVisible,
  name,
  onClose,
  role,
}: {
  email: string;
  isVisible: boolean;
  name: string;
  onClose: () => void;
  role: string;
}) {
  const { theme } = useAppTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isVisible}>
      <View className="flex-1 flex-row" style={{ backgroundColor: "rgba(0, 0, 0, 0.42)" }}>
        <SafeAreaView
          className="h-full w-[88%]"
          style={{ backgroundColor: theme.background }}
        >
          <ScrollView
            bounces={false}
            contentContainerClassName="px-5 pb-10 pt-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-7 flex-row items-center justify-between">
              <Pressable
                accessibilityLabel="Open account"
                accessibilityRole="button"
                className="flex-1 flex-row items-center"
                onPress={() => {
                  selectionHaptic();
                  onClose();
                  router.push("/dashboard" as never);
                }}
              >
                <View
                  className="mr-4 h-20 w-20 items-center justify-center rounded-[28px] border"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }}
                >
                  <Text className="text-[22px] font-bold" style={{ color: theme.text }}>
                    {getInitials(name)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[24px] font-bold" numberOfLines={1} style={{ color: theme.text }}>
                    {name}
                  </Text>
                  <Text className="mt-1 text-[16px] font-semibold" style={{ color: theme.mutedText }}>
                    {role}
                  </Text>
                  <Text className="mt-1 text-xs" numberOfLines={1} style={{ color: theme.mutedText }}>
                    {email}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityLabel="Close menu"
                accessibilityRole="button"
                className="ml-4 h-14 w-14 items-center justify-center rounded-[22px] border"
                onPress={() => {
                  selectionHaptic();
                  onClose();
                }}
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <Text className="text-3xl" style={{ color: theme.text }}>
                  x
                </Text>
              </Pressable>
            </View>

            <View className="mb-6 h-px" style={{ backgroundColor: theme.border }} />

            <Text className="mb-4 text-[20px] font-bold" style={{ color: theme.text }}>
              Organizacion
            </Text>
            <View
              className="mb-8 flex-row items-center rounded-[24px] px-5 py-4"
              style={{ backgroundColor: theme.backgroundMuted }}
            >
              <Text className="mr-4 text-[24px]" style={{ color: theme.mutedText }}>
                ?
              </Text>
              <Text className="flex-1 text-[17px]" style={{ color: theme.mutedText }}>
                Buscar organizaciones...
              </Text>
            </View>

            {drawerOrganizations.map((organization, index) => (
              <Animated.View
                entering={FadeInDown.duration(420)
                  .delay(index * 90)
                  .easing(Easing.out(Easing.quad))}
                key={organization.id}
              >
                <DrawerOrganizationRow {...organization} />
              </Animated.View>
            ))}
          </ScrollView>
        </SafeAreaView>

        <Pressable accessibilityLabel="Close menu overlay" className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { theme } = useAppTheme();

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const role = (session.user as { role?: string }).role ?? "Usuario";
  const homeIcons = {
    notifications: require("../../assets/notifications_blanco.png"),
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="flex-1 px-5 pb-8 pt-5">
        <View className="flex-row items-center justify-between">
          <HeaderButton
            accessibilityLabel="Open menu"
            onPress={() => {
              selectionHaptic();
              setIsDrawerOpen(true);
            }}
          >
            <MenuGlyph />
          </HeaderButton>
          <Text className="text-[24px] font-semibold" style={{ color: theme.text }}>
            Home
          </Text>
          <HeaderButton
            accessibilityLabel="Open notifications"
            onPress={() => {
              selectionHaptic();
              router.push("/notifications" as never);
            }}
          >
            <Image
              className="h-5 w-5"
              resizeMode="contain"
              source={homeIcons.notifications}
              style={{ tintColor: theme.text }}
            />
          </HeaderButton>
        </View>

        <View className="flex-1 justify-center">
          <Animated.View
            className="rounded-[32px] border px-6 py-7"
            entering={FadeInDown.duration(520).easing(Easing.out(Easing.quad))}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <Text className="text-[28px] font-bold" style={{ color: theme.text }}>
              Hola, {session.user.name.split(" ")[0] || session.user.name}
            </Text>
            <Text className="mt-3 text-[16px] leading-6" style={{ color: theme.mutedText }}>
              Todo listo por ahora.
            </Text>
          </Animated.View>
        </View>
      </View>

      <HomeDrawer
        email={session.user.email}
        isVisible={isDrawerOpen}
        name={session.user.name}
        onClose={() => setIsDrawerOpen(false)}
        role={role}
      />
    </SafeAreaView>
  );
}
