import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { IncomePeopleDrawer } from "@/features/ingresos/components/income-people-drawer";
import { HomeHeader } from "@/shared/components/ui/home-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="flex-1 px-5 pb-8 pt-5">
        <HomeHeader
          onOpenMenu={() => {
            selectionHaptic();
            setIsDrawerOpen(true);
          }}
          onOpenNotifications={() => {
            selectionHaptic();
            router.navigate("/notifications" as never);
          }}
        />

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

      <IncomePeopleDrawer
        email={session.user.email}
        isVisible={isDrawerOpen}
        name={session.user.name}
        onClose={() => setIsDrawerOpen(false)}
        role={role}
      />
    </SafeAreaView>
  );
}
