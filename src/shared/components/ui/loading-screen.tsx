import { Image, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppProgressBar } from "@/shared/components/ui/app-progress-bar";
import { useAppTheme } from "@/shared/lib/theme-context";

const appLogo = require("../../../../assets/logo.png");

export function LoadingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-[320px] px-6 py-7">
          <View className="items-center">
            <Image
              resizeMode="contain"
              source={appLogo}
              style={{
                height: 136,
                width: 136,
              }}
            />
          </View>
          <AppProgressBar />
          <Text className="mt-5 text-center text-base font-semibold" style={{ color: theme.text }}>
            {t("common.loadingSession")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
