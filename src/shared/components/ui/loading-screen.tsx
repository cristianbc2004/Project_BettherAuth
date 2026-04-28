import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppProgressBar } from "@/shared/components/ui/app-progress-bar";
import { useAppTheme } from "@/shared/lib/theme-context";

export function LoadingScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-[320px] rounded-[30px] border px-6 py-7" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <AppProgressBar />
          <Text className="mt-5 text-center text-base font-semibold" style={{ color: theme.text }}>
            {t("common.loadingSession")}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5" style={{ color: theme.mutedText }}>
            Better Auth Dashboard
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
