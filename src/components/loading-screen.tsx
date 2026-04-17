import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <View className="flex-1 items-center justify-center px-8">
        <ActivityIndicator color="#f6efe6" size="large" />
        <Text className="mt-4 text-center text-base text-sand">{t("common.loadingSession")}</Text>
      </View>
    </SafeAreaView>
  );
}
