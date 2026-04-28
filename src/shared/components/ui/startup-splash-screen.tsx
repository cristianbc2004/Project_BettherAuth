import { Image, Text, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppProgressBar } from "@/shared/components/ui/app-progress-bar";
import { useAppTheme } from "@/shared/lib/theme-context";

const splashLogo = require("../../../../assets/logo.png");

export function StartupSplashScreen() {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          className="w-full max-w-[320px] items-center"
          entering={FadeIn.duration(420).easing(Easing.out(Easing.quad))}
        >
          <Image
            resizeMode="contain"
            source={splashLogo}
            style={{
              height: 220,
              width: 220,
              opacity: 1,
            }}
          />
          <Animated.View
            className="mt-8 w-full rounded-[30px] border px-6 py-7"
            entering={FadeInDown.duration(520).delay(180).easing(Easing.out(Easing.quad))}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <AppProgressBar />
            <Text className="mt-5 text-center text-base font-semibold" style={{ color: theme.text }}>
              Better Auth
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
