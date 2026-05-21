import { Redirect, router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, Clock3, MapPin } from "lucide-react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { mockIngresos, type IncomePerson } from "@/features/ingresos/mocks";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

const STADIA_MAPS_API_KEY = process.env.EXPO_PUBLIC_STADIA_MAPS_API_KEY?.trim() ?? "";
const MAP_STYLE_URL = STADIA_MAPS_API_KEY
  ? `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${STADIA_MAPS_API_KEY}`
  : "";

const mapLibre =
  Platform.OS === "web"
    ? null
    : (require("@maplibre/maplibre-react-native") as typeof import("@maplibre/maplibre-react-native"));

const Map = mapLibre?.Map;
const Camera = mapLibre?.Camera;
const Marker = mapLibre?.Marker;

function getSelectedPerson(personId?: string) {
  const selectedPersonId = personId ? Number(personId) : undefined;

  return (
    mockIngresos.detalles.find((person) => person.id === selectedPersonId) ??
    mockIngresos.detalles[0]
  );
}

function formatLastUpdated(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: IncomePerson["location"]["status"]) {
  switch (status) {
    case "moving":
      return "On route";
    case "offline":
      return "Offline";
    case "online":
    default:
      return "Available";
  }
}

function getStatusColors(status: IncomePerson["location"]["status"], theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (status) {
    case "moving":
      return {
        accent: theme.primary,
        soft: theme.primarySoft,
      };
    case "offline":
      return {
        accent: theme.danger,
        soft: "rgba(220, 38, 38, 0.14)",
      };
    case "online":
    default:
      return {
        accent: theme.success,
        soft: "rgba(5, 150, 105, 0.14)",
      };
  }
}

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
  const statusColors = getStatusColors(person.location.status, theme);

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
  const initialPerson = useMemo(() => getSelectedPerson(personId), [personId]);
  const [selectedPerson, setSelectedPerson] = useState<IncomePerson>(initialPerson);
  const cameraRef = useRef<import("@maplibre/maplibre-react-native").CameraRef | null>(null);

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

  if (Platform.OS === "web" || !Map || !Camera || !Marker) {
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

  if (!MAP_STYLE_URL) {
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
              Stadia Maps configuration is missing
            </AppText>
            <AppText className="mt-3 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              Add `EXPO_PUBLIC_STADIA_MAPS_API_KEY` to `.env` and restart Expo so the map can load the street style.
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Map
        attribution={false}
        compass
        compassPosition={{ top: 120, right: 16 }}
        logo={false}
        mapStyle={MAP_STYLE_URL}
        scaleBar={false}
        style={{ flex: 1 }}
        touchPitch={false}
        touchRotate={false}
      >
        <Camera
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
          <Marker
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
          </Marker>
        ))}
      </Map>

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
                style={{ backgroundColor: getStatusColors(selectedPerson.location.status, theme).soft }}
              >
                <AppText
                  className="text-[12px] font-semibold leading-4"
                  numberOfLines={1}
                  style={{ color: getStatusColors(selectedPerson.location.status, theme).accent }}
                >
                  {getStatusLabel(selectedPerson.location.status)}
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
                  {formatLastUpdated(selectedPerson.location.lastUpdatedAt)}
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
