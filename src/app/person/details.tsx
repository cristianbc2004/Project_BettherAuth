import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { PersonDetailsSkeleton } from "@/features/ingresos/components/person/person-skeletons";
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

export default function PersonDetailsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending, PERSON_SKELETON_MINIMUM_MS, {
    showOnMount: true,
  });
  const { theme } = useAppTheme();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPerson = getSelectedPerson(personId);
  const generalHref = personId ? (`/person?personId=${personId}` as const) : "/person";

  if (showSessionLoading) {
    return <PersonDetailsSkeleton />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <PersonScreenHeader backHref={generalHref} title="Detalles" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mt-6">
          <AppText className="text-[20px] font-bold leading-[26px]" style={{ color: theme.text }}>
            {selectedPerson.nombre}
          </AppText>
          <AppText className="mt-2 text-[16px] leading-[22px]" style={{ color: theme.mutedText }}>
            Detalle de ingresos - {mockIngresos.general.periodo}
          </AppText>
        </View>

        <View className="mt-8">
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <AppText className="text-[20px] font-bold leading-[26px]" numberOfLines={2} style={{ color: theme.text }}>
                {selectedPerson.nombre}
              </AppText>
              <AppText className="mt-1 text-[15px] font-semibold leading-6" numberOfLines={2} style={{ color: theme.mutedText }}>
                {selectedPerson.cargo}
              </AppText>
            </View>
            <View className="px-3 py-2">
              <AppText className="text-[13px] font-bold leading-5" style={{ color: theme.text, fontVariant: ["tabular-nums"] }}>
                {selectedPerson.porcentajeDelTotal}%
              </AppText>
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                Ingresos
              </AppText>
              <AppText
                className="mt-1 text-[22px] font-bold leading-[30px]"
                numberOfLines={1}
                style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
              >
                {formatCurrency(selectedPerson.ingresos)}
              </AppText>
            </View>
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                {"Comisi\u00f3n"}
              </AppText>
              <AppText
                className="mt-1 text-[22px] font-bold leading-[30px]"
                numberOfLines={1}
                style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
              >
                {formatCurrency(selectedPerson.comision)}
              </AppText>
            </View>
          </View>

          <View className="mt-5 flex-row gap-8">
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                Ventas
              </AppText>
              <AppText className="mt-1 text-[20px] font-bold leading-[26px]" style={{ color: theme.text, fontVariant: ["tabular-nums"] }}>
                {selectedPerson.ventasRealizadas}
              </AppText>
            </View>
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                % Del total
              </AppText>
              <AppText className="mt-1 text-[20px] font-bold leading-[26px]" style={{ color: theme.text, fontVariant: ["tabular-nums"] }}>
                {selectedPerson.porcentajeDelTotal}%
              </AppText>
            </View>
          </View>

          <View className="mt-5 h-px" style={{ backgroundColor: theme.border }} />
          <AppText className="mt-4 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            {selectedPerson.observacion}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
