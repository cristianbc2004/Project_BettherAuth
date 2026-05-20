import { Redirect } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

const privacySections = [
  {
    body: "Account data is used to identify the user, keep the session active, and apply permissions such as user or administrator access.",
    title: "Account data",
  },
  {
    body: "The financial and worker information shown here is demo content used to navigate the experience.",
    title: "Demo data",
  },
  {
    body: "Sensitive actions should pass through authentication, session validation, and role checks before reaching real services.",
    title: "Security",
  },
];

export default function PrivacyPolicyScreen() {
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
        <AppScreenHeader fallbackHref="/home" title="Privacy" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="pb-5">
          <AppText className="text-[18px] font-bold leading-6" style={{ color: theme.text }}>
            A clear foundation for protecting the account
          </AppText>
          <AppText className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            This static content is a realistic placeholder for a future legal review.
          </AppText>
        </View>

        {privacySections.map((section) => (
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
