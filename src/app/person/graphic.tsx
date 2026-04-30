import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { Graphic } from "@/features/ingresos/components/person/graphic";
import { PersonGraphicSkeleton } from "@/features/ingresos/components/person/person-skeletons";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const PERSON_SKELETON_MINIMUM_MS = 3000;

export default function PersonGraphicScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending, PERSON_SKELETON_MINIMUM_MS, {
    showOnMount: true,
  });
  const { theme } = useAppTheme();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPersonId = personId ? Number(personId) : undefined;
  const initialSelectedPersonId = Number.isFinite(selectedPersonId) ? selectedPersonId : undefined;
  const generalHref = personId ? (`/person?personId=${personId}` as const) : "/person";

  if (showSessionLoading) {
    return <PersonGraphicSkeleton />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-32 pt-20"
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
    >
      <PersonScreenHeader backHref={generalHref} title="Gráfica de ingresos" />
      <Graphic initialSelectedPersonId={initialSelectedPersonId} />
    </ScrollView>
  );
}
