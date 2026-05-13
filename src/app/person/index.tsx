import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { PersonGeneralSkeleton } from "@/features/ingresos/components/person/person-skeletons";
import { mockIngresos } from "@/features/ingresos/mocks";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function getSelectedPerson(personId?: string) {
  const selectedPersonId = personId ? Number(personId) : undefined;

  return (
    mockIngresos.detalles.find((person) => person.id === selectedPersonId) ??
    mockIngresos.detalles[0]
  );
}

const PERSON_SKELETON_MINIMUM_MS = 3000;

export default function PersonGeneralScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending, PERSON_SKELETON_MINIMUM_MS, {
    showOnMount: true,
  });
  const { theme } = useAppTheme();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPerson = getSelectedPerson(personId);

  if (showSessionLoading) {
    return <PersonGeneralSkeleton />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <PersonScreenHeader backHref="/home" title="Informacion general" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mt-5">
          <AppText className="text-[22px] font-bold leading-[28px]" style={{ color: theme.text }}>
            {selectedPerson.nombre}
          </AppText>
          <AppText className="mt-2 text-[16px] leading-[22px]" style={{ color: theme.mutedText }}>
            {selectedPerson.cargo}
          </AppText>
        </View>

        <View className="mt-7">
          <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
            Ingreso del periodo
          </AppText>
          <AppText
            className="mt-2 text-[30px] font-bold leading-[38px]"
            style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
          >
            {formatCurrency(selectedPerson.ingresos)}
          </AppText>
          <AppText className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            {mockIngresos.general.periodo}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
