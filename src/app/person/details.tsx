import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays, MapPin } from "lucide-react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { mockIngresos } from "@/features/ingresos/mocks";
import { usePersonSelection } from "@/features/ingresos/lib/person-selection-context";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatSaleDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function getSelectedPerson(personId?: string) {
  const selectedPersonId = personId ? Number(personId) : undefined;

  return (
    mockIngresos.detalles.find((person) => person.id === selectedPersonId) ??
    mockIngresos.detalles[0]
  );
}

function getSelectedPersonId(personId?: string, fallbackPersonId?: number) {
  const selectedPersonId = personId ? Number(personId) : fallbackPersonId;

  return Number.isFinite(selectedPersonId) ? selectedPersonId : undefined;
}

export default function PersonDetailsScreen() {
  const { data: session } = authClient.useSession();
  const { theme } = useAppTheme();
  const { selectedPersonId: selectedPersonIdFromTabs } = usePersonSelection();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPersonId = getSelectedPersonId(personId, selectedPersonIdFromTabs);
  const selectedPerson = getSelectedPerson(selectedPersonId ? String(selectedPersonId) : undefined);
  const generalHref = selectedPersonId ? (`/person?personId=${selectedPersonId}` as const) : "/person";

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
          </View>

          <View className="mt-5 h-px" style={{ backgroundColor: theme.border }} />
          <AppText className="mt-4 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            {selectedPerson.observacion}
          </AppText>
        </View>

        <View className="mt-8">
          <View className="flex-row items-end justify-between gap-4">
            <View className="min-w-0 flex-1">
              <AppText className="text-[18px] font-bold leading-6" style={{ color: theme.text }}>
                Ubicacion de ventas
              </AppText>
            </View>
          </View>

          <View className="mt-4 gap-3">
            {selectedPerson.ventas.map((sale) => (
              <View
                className="rounded-[22px] border px-4 py-4"
                key={sale.id}
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <View className="flex-row items-start justify-between gap-4">
                  <View className="min-w-0 flex-1">
                    <AppText className="text-[15px] font-bold leading-5" numberOfLines={1} style={{ color: theme.text }}>
                      {sale.cliente}
                    </AppText>
                    <View className="mt-2 flex-row items-start gap-2">
                      <MapPin color={theme.primary} size={15} strokeWidth={2.2} />
                      <AppText className="min-w-0 flex-1 text-[13px] leading-5" numberOfLines={2} style={{ color: theme.mutedText }}>
                        {sale.location.address}, {sale.location.city}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    className="text-[15px] font-bold leading-5"
                    numberOfLines={1}
                    style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
                  >
                    {formatCurrency(sale.importe)}
                  </AppText>
                </View>

                <View className="mt-3 flex-row items-center justify-between gap-3">
                  <View className="flex-row items-center gap-2">
                    <CalendarDays color={theme.mutedText} size={14} strokeWidth={2.1} />
                    <AppText className="text-[12px] font-semibold leading-4" style={{ color: theme.mutedText }}>
                      {formatSaleDate(sale.fecha)}
                    </AppText>
                  </View>
                  
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
