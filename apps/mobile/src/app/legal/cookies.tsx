import { Redirect } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

const cookieSections = [
  {
    body: "We use technical cookies and secure storage to keep your session active, remember basic preferences, and protect account access.",
    title: "Essential use",
  },
  {
    body: "Language, theme, and navigation preferences may be saved on the device so the experience stays consistent when you reopen the app.",
    title: "Preferences",
  },
  {
    body: "We do not sell personal information or use advertising cookies in this demo version. The data shown is static or for testing.",
    title: "Advertising",
  },
];

export default function CookiePolicyScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <AppScreenHeader fallbackHref="/home" title="Cookies" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="pb-5">
          <AppText className="text-[18px] font-bold leading-6" style={{ color: theme.text }}>
            Transparency about local data
          </AppText>
          <AppText className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            This informational screen helps the app feel complete before real legal copy is connected.
          </AppText>
        </View>

        {cookieSections.map((section) => (
          <View
            className="border-t py-5"
            key={section.title}
            style={{ borderColor: theme.border }}
          >
            <AppText className="text-[16px] font-bold" style={{ color: theme.text }}>
              {section.title}
            </AppText>
            <AppText className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              {section.body}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
