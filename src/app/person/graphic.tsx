import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { Graphic } from "@/features/ingresos/components/person/graphic";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function PersonGraphicScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPersonId = personId ? Number(personId) : undefined;
  const initialSelectedPersonId = Number.isFinite(selectedPersonId) ? selectedPersonId : undefined;

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
      <PersonScreenHeader title="Gráfica de ingresos" />
      <Graphic initialSelectedPersonId={initialSelectedPersonId} />
    </ScrollView>
  );
}
