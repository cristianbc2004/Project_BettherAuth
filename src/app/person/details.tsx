import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { PersonDetailsSkeleton } from "@/features/ingresos/components/person/person-skeletons";
import { mockIngresos } from "@/features/ingresos/services/income-mock";
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

export default function PersonDetailsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending, PERSON_SKELETON_MINIMUM_MS, {
    showOnMount: true,
  });
  const { theme } = useAppTheme();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPerson = getSelectedPerson(personId);

  if (showSessionLoading) {
    return <PersonDetailsSkeleton />;
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
      <View className="mt-6">
        <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
          {selectedPerson.nombre}
        </Text>
        <Text className="mt-2 text-[16px]" style={{ color: theme.mutedText }}>
          Detalle de ingresos - {mockIngresos.general.periodo}
        </Text>
      </View>

      <View className="mt-8">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
              {selectedPerson.nombre}
            </Text>
            <Text className="mt-1 text-[15px] font-semibold" style={{ color: theme.mutedText }}>
              {selectedPerson.cargo}
            </Text>
          </View>
          <View className="px-3 py-2">
            <Text className="text-[13px] font-bold" style={{ color: theme.text }}>
              {selectedPerson.porcentajeDelTotal}%
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
              Ingresos
            </Text>
            <Text className="mt-1 text-[22px] font-bold" style={{ color: theme.text }}>
              {formatCurrency(selectedPerson.ingresos)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
              {"Comisi\u00f3n"}
            </Text>
            <Text className="mt-1 text-[22px] font-bold" style={{ color: theme.text }}>
              {formatCurrency(selectedPerson.comision)}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-8">
          <View className="flex-1">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
              Ventas
            </Text>
            <Text className="mt-1 text-[20px] font-bold" style={{ color: theme.text }}>
              {selectedPerson.ventasRealizadas}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
              % Del total
            </Text>
            <Text className="mt-1 text-[20px] font-bold" style={{ color: theme.text }}>
              {selectedPerson.porcentajeDelTotal}%
            </Text>
          </View>
        </View>

        <View className="mt-5 h-px" style={{ backgroundColor: theme.border }} />
        <Text className="mt-4 text-[15px] leading-6" style={{ color: theme.mutedText }}>
          {selectedPerson.observacion}
        </Text>
      </View>
    </ScrollView>
  );
}
