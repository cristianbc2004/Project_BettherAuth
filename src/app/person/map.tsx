import { Redirect, router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, Clock3, MapPin } from "lucide-react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { PersonGeneralSkeleton } from "@/features/ingresos/components/person/person-skeletons";
import { mockIngresos, type IncomePerson } from "@/features/ingresos/mocks";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const PERSON_SKELETON_MINIMUM_MS = 3000;
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
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: IncomePerson["location"]["status"]) {
  switch (status) {
    case "moving":
      return "En ruta";
    case "offline":
      return "Sin conexion";
    case "online":
    default:
      return "Disponible";
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
      accessibilityLabel={`Seleccionar a ${person.nombre} en el mapa`}
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
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending, PERSON_SKELETON_MINIMUM_MS, {
    showOnMount: true,
  });
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

  if (showSessionLoading) {
    return <PersonGeneralSkeleton />;
  }

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
            <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
              El mapa estara disponible en iOS y Android
            </Text>
            <Text className="mt-3 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              Esta ruta usa MapLibre nativo. En web dejamos esta vista de apoyo para no romper el proyecto mientras seguimos desarrollando la experiencia movil.
            </Text>
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
            <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
              Falta configurar Stadia Maps
            </Text>
            <Text className="mt-3 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              Añade `EXPO_PUBLIC_STADIA_MAPS_API_KEY` en el `.env` y reinicia Expo para que el mapa pueda cargar el estilo de calles.
            </Text>
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
              <View className="flex-1">
                <Text className="text-[22px] font-bold" style={{ color: theme.text }}>
                  {selectedPerson.nombre}
                </Text>
                <Text className="mt-1 text-[15px]" style={{ color: theme.mutedText }}>
                  {selectedPerson.cargo}
                </Text>
              </View>

              <View
                className="rounded-full px-3 py-2"
                style={{ backgroundColor: getStatusColors(selectedPerson.location.status, theme).soft }}
              >
                <Text
                  className="text-[12px] font-semibold"
                  style={{ color: getStatusColors(selectedPerson.location.status, theme).accent }}
                >
                  {getStatusLabel(selectedPerson.location.status)}
                </Text>
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
                  <Text className="text-[12px] font-semibold uppercase" style={{ color: theme.mutedText }}>
                    Coordenadas
                  </Text>
                </View>
                <Text className="mt-2 text-[14px] font-semibold" style={{ color: theme.text }}>
                  {selectedPerson.location.latitude.toFixed(4)}, {selectedPerson.location.longitude.toFixed(4)}
                </Text>
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
                  <Text className="text-[12px] font-semibold uppercase" style={{ color: theme.mutedText }}>
                    Ultima señal
                  </Text>
                </View>
                <Text className="mt-2 text-[14px] font-semibold" style={{ color: theme.text }}>
                  {formatLastUpdated(selectedPerson.location.lastUpdatedAt)}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel={`Ver detalles de ${selectedPerson.nombre}`}
              accessibilityRole="button"
              className="mt-5 items-center justify-center rounded-full px-4 py-4"
              onPress={() => {
                selectionHaptic();
                router.navigate(`/person/details?personId=${selectedPerson.id}` as never);
              }}
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: theme.textOnPrimary }}>
                Ver detalle del trabajador
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
