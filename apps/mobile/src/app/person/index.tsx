import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { mockIngresos } from "@/features/ingresos/mocks";
import {
  formatPersonCurrency,
  getPersonGeneralHref,
  getSelectedPerson,
  getSelectedPersonId,
} from "@/features/ingresos/lib/person-screen";
import { usePersonSelection } from "@/features/ingresos/lib/person-selection-context";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

export default function PersonGeneralScreen() {
  const { data: session } = authClient.useSession();
  const { theme } = useAppTheme();
  const { selectedPersonId: selectedPersonIdFromTabs } = usePersonSelection();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const selectedPersonId = getSelectedPersonId(personId, selectedPersonIdFromTabs);
  const selectedPerson = getSelectedPerson(selectedPersonId);
  const generalHref = getPersonGeneralHref(selectedPersonId);

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <PersonScreenHeader backHref={generalHref} title="General" />
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
            Income details - {mockIngresos.general.periodo}
          </AppText>
        </View>

        <View className="mt-8">
          <View className="mt-5 flex-row gap-3">
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                Income
              </AppText>
              <AppText
                className="mt-1 text-[22px] font-bold leading-[30px]"
                numberOfLines={1}
                style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
              >
                {formatPersonCurrency(selectedPerson.ingresos)}
              </AppText>
            </View>
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                Commission
              </AppText>
              <AppText
                className="mt-1 text-[22px] font-bold leading-[30px]"
                numberOfLines={1}
                style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
              >
                {formatPersonCurrency(selectedPerson.comision)}
              </AppText>
            </View>
          </View>

          <View className="mt-5 flex-row gap-8">
            <View className="flex-1">
              <AppText className="text-[13px] font-semibold uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>
                Sales
              </AppText>
              <AppText className="mt-1 text-[20px] font-bold leading-[26px]" style={{ color: theme.text, fontVariant: ["tabular-nums"] }}>
                {selectedPerson.ventasRealizadas}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
