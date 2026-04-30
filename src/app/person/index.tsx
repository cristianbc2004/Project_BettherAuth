import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { PersonGeneralSkeleton } from "@/features/ingresos/components/person/person-skeletons";
import { mockIngresos } from "@/features/ingresos/mocks";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

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
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-32 pt-20"
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
    >
      <PersonScreenHeader backHref="/home" title="Información general" />

      <View className="mt-8">
        <Text className="text-[28px] font-bold" style={{ color: theme.text }}>
          {selectedPerson.nombre}
        </Text>
        <Text className="mt-2 text-[16px]" style={{ color: theme.mutedText }}>
          {selectedPerson.cargo}
        </Text>
      </View>

      <View className="mt-10">
        <Text className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
          Ingreso del periodo
        </Text>
        <Text className="mt-2 text-[36px] font-bold" style={{ color: theme.text }}>
          {formatCurrency(selectedPerson.ingresos)}
        </Text>
        <Text className="mt-2 text-[15px]" style={{ color: theme.mutedText }}>
          {mockIngresos.general.periodo}
        </Text>
      </View>
    </ScrollView>
  );
}
