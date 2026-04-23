import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthBrandMark } from "@/features/auth/components/auth-brand-mark";
import { useAppTheme } from "@/shared/lib/theme";

export function LoadingScreen() {
  const { t } = useTranslation();
  const { colorScheme, theme } = useAppTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 420,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["18%", "92%"],
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
        <View
          className="absolute inset-x-0 top-0 h-[260px]"
          style={{
            backgroundColor:
              colorScheme === "light" ? "rgba(141, 61, 255, 0.08)" : "rgba(42, 26, 82, 0.1)",
          }}
        />
      </View>

      <View className="flex-1 justify-center px-8">
        <View className="items-center">
          <AuthBrandMark />

          <View
            className="mt-16 w-full max-w-[320px] items-center rounded-[32px] px-6 py-8"
            style={{
              backgroundColor: theme.cardMuted,
              borderColor: theme.border,
              borderWidth: 1,
            }}
          >
            <ActivityIndicator color={theme.primary} size="large" />
            <Text
              className="mt-5 text-center text-[17px] font-semibold"
              style={{ color: theme.text }}
            >
              {t("common.loadingSession")}
            </Text>
            <View
              className="mt-6 h-2 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: colorScheme === "light" ? "rgba(31, 25, 43, 0.1)" : "rgba(255, 255, 255, 0.08)" }}
            >
              <Animated.View
                className="h-full rounded-full"
                style={{ backgroundColor: theme.primary, width: progressWidth }}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
