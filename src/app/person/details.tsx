import { Redirect } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function PersonDetailsScreen() {
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
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-10 pt-20"
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
    >
      <PersonScreenHeader title="Detalles" />
      <View
        className="mt-6 rounded-[28px] border px-5 py-5"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <Text className="text-[16px]" style={{ color: theme.mutedText }}>
          Base de la pantalla de detalles.
        </Text>
      </View>
    </ScrollView>
  );
}
