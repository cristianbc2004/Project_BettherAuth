import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { Graphic } from "@/features/ingresos/components/person/graphic";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { usePersonSelection } from "@/features/ingresos/lib/person-selection-context";
import { useAppTheme } from "@/shared/lib/theme-context";

export default function PersonGraphicScreen() {
  const { data: session } = authClient.useSession();
  const { theme } = useAppTheme();
  const { setSelectedPersonId } = usePersonSelection();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const [isChartInteracting, setIsChartInteracting] = useState(false);
  const selectedPersonId = personId ? Number(personId) : undefined;
  const initialSelectedPersonId = Number.isFinite(selectedPersonId) ? selectedPersonId : undefined;
  const generalHref = personId ? (`/person?personId=${personId}` as const) : "/person";
  const handleGraphInteractionChange = useCallback((isInteracting: boolean) => {
    setIsChartInteracting(isInteracting);
  }, []);
  const handleSelectedPersonChange = useCallback((nextPersonId: number) => {
    setSelectedPersonId(nextPersonId);
    router.setParams({ personId: String(nextPersonId) });
  }, [setSelectedPersonId]);

  useEffect(() => {
    if (initialSelectedPersonId) {
      setSelectedPersonId(initialSelectedPersonId);
    }
  }, [initialSelectedPersonId, setSelectedPersonId]);

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <PersonScreenHeader backHref={generalHref} title="Grafica de ingresos" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
        scrollEnabled={!isChartInteracting}
      >
        <Graphic
          initialSelectedPersonId={initialSelectedPersonId}
          onGraphInteractionChange={handleGraphInteractionChange}
          onSelectedPersonChange={handleSelectedPersonChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
