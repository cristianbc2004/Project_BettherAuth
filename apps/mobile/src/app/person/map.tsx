import { Redirect, router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, Clock3, MapPin } from "lucide-react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { mockIngresos, type IncomePerson } from "@/features/ingresos/mocks";
import {
  formatPersonLastUpdated,
  getPersonStatusColors,
  getPersonStatusLabel,
  getSelectedPerson,
  parsePersonId,
} from "@/features/ingresos/lib/person-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { getNativeMapComponents, nativeMapStyleUrl } from "@/shared/lib/native-map";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

type WorkerMarkerProps = {
  isSelected: boolean;
  onPress: () => void;
  person: IncomePerson;
};

const WorkerMarker = memo(function WorkerMarker({
  isSelected,
  onPress,
  person,
}: WorkerMarkerProps) {
  const { theme } = useAppTheme();
  const statusColors = getPersonStatusColors(person.location.status, theme);

  return (
    <Pressable
      accessibilityLabel={`Select ${person.nombre} on the map`}
      accessibilityRole="button"
      className="items-center"
      onPress={onPress}
    >
      <View
        className="items-center justify-center rounded-full border-2"
        style={{
          backgroundColor: isSelected ? statusColors.accent : theme.card,
          borderColor: isSelected ? theme.backgroundElevated : statusColors.accent,
          height: isSelected ? 50 : 42,
          width: isSelected ? 50 : 42,
        }}
      >
        <Briefcase
          color={isSelected ? theme.textOnPrimary : statusColors.accent}
          size={isSelected ? 22 : 18}
          strokeWidth={2.2}
        />
      </View>
      <View
        style={{
          borderLeftColor: "transparent",
          borderLeftWidth: 9,
          borderRightColor: "transparent",
          borderRightWidth: 9,
          borderTopColor: isSelected ? statusColors.accent : theme.card,
          borderTopWidth: 12,
          marginTop: -2,
        }}
      />
    </Pressable>
  );
});

export default function PersonMapScreen() {
  const { data: session } = authClient.useSession();
  const { theme } = useAppTheme();
  const { personId } = useLocalSearchParams<{ personId?: string }>();
  const initialPerson = useMemo(() => getSelectedPerson(parsePersonId(personId)), [personId]);
  const [selectedPerson, setSelectedPerson] = useState<IncomePerson>(initialPerson);
  const cameraRef = useRef<import("@maplibre/maplibre-react-native").CameraRef | null>(null);
  const nativeMap = getNativeMapComponents();
  const selectedStatusColors = getPersonStatusColors(selectedPerson.location.status, theme);

  const focusPerson = useCallback((person: IncomePerson) => {
    selectionHaptic();
    setSelectedPerson(person);
    cameraRef.current?.flyTo({
      center: [person.location.longitude, person.location.latitude],
      duration: 900,
      zoom: 13.6,
    });
  }, []);

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!nativeMap) {
    return (
      <SafeAreaView className="flex-1" edges={["top", "bottom"]} style={{ backgroundColor: theme.background }}>
        <View className="flex-1 px-5 pt-6">
          <View
            className="mt-8 rounded-[28px] border px-5 py-6"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <AppText className="text-[18px] font-bold" style={{ color: theme.text }}>
              The map will be available on iOS and Android
            </AppText>
            <AppText className="mt-3 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              This route uses native MapLibre. On web, we show this fallback view to keep the project stable while the mobile experience continues to evolve.
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <nativeMap.Map
        attribution={false}
        compass
        compassPosition={{ top: 120, right: 16 }}
        logo={false}
        mapStyle={nativeMapStyleUrl}
        scaleBar={false}
        style={{ flex: 1 }}
        touchPitch={false}
        touchRotate={false}
      >
        <nativeMap.Camera
          initialViewState={{
            center: [selectedPerson.location.longitude, selectedPerson.location.latitude],
            pitch: 0,
            zoom: 11.8,
          }}
          maxZoom={16}
          minZoom={9}
          ref={cameraRef}
        />

        {mockIngresos.detalles.map((person) => (
          <nativeMap.Marker
            anchor="bottom"
            id={`worker-${person.id}`}
            key={person.id}
            lngLat={[person.location.longitude, person.location.latitude]}
            onPress={() => focusPerson(person)}
          >
            <WorkerMarker
              isSelected={person.id === selectedPerson.id}
              onPress={() => focusPerson(person)}
              person={person}
            />
          </nativeMap.Marker>
        ))}
      </nativeMap.Map>

      <SafeAreaView
        className="absolute inset-x-0 bottom-0"
        edges={["bottom"]}
        pointerEvents="box-none"
      >
        <View className="px-5 pb-4">
          <View
            className="rounded-[30px] border px-5 pb-5 pt-5"
            style={{
              backgroundColor: theme.backgroundElevated,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row items-start justify-between gap-4">
              <View className="min-w-0 flex-1">
                <AppText className="text-[22px] font-bold leading-[28px]" numberOfLines={2} style={{ color: theme.text }}>
                  {selectedPerson.nombre}
                </AppText>
                <AppText className="mt-1 text-[15px] leading-6" numberOfLines={2} style={{ color: theme.mutedText }}>
                  {selectedPerson.cargo}
                </AppText>
              </View>

              <View
                className="rounded-full px-3 py-2"
                style={{ backgroundColor: selectedStatusColors.soft }}
              >
                <AppText
                  className="text-[12px] font-semibold leading-4"
                  numberOfLines={1}
                  style={{ color: selectedStatusColors.accent }}
                >
                  {getPersonStatusLabel(selectedPerson.location.status)}
                </AppText>
              </View>
            </View>

            <View className="mt-5 flex-row gap-3">
              <View
                className="flex-1 rounded-[20px] border px-4 py-4"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <MapPin color={theme.primary} size={16} strokeWidth={2.2} />
                  <AppText className="text-[12px] font-semibold uppercase" style={{ color: theme.mutedText }}>
                    Coordinates
                  </AppText>
                </View>
                <AppText className="mt-2 text-[14px] font-semibold leading-5" numberOfLines={2} style={{ color: theme.text, fontVariant: ["tabular-nums"] }}>
                  {selectedPerson.location.latitude.toFixed(4)}, {selectedPerson.location.longitude.toFixed(4)}
                </AppText>
              </View>

              <View
                className="flex-1 rounded-[20px] border px-4 py-4"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Clock3 color={theme.primary} size={16} strokeWidth={2.2} />
                  <AppText className="text-[12px] font-semibold uppercase" style={{ color: theme.mutedText }}>
                    Last signal
                  </AppText>
                </View>
                <AppText className="mt-2 text-[14px] font-semibold leading-5" numberOfLines={2} style={{ color: theme.text, fontVariant: ["tabular-nums"] }}>
                  {formatPersonLastUpdated(selectedPerson.location.lastUpdatedAt)}
                </AppText>
              </View>
            </View>

            <Pressable
              accessibilityLabel={`View details for ${selectedPerson.nombre}`}
              accessibilityRole="button"
              className="mt-5 items-center justify-center rounded-full px-4 py-4"
              onPress={() => {
                selectionHaptic();
                router.navigate(`/person/details?personId=${selectedPerson.id}` as never);
              }}
              style={{ backgroundColor: theme.primary }}
            >
              <AppText className="text-[15px] font-semibold" style={{ color: theme.textOnPrimary }}>
                View worker details
              </AppText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
