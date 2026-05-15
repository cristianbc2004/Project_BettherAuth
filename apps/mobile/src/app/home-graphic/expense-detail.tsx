import { Redirect, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Navigation } from "lucide-react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { allTransactions } from "@/features/finance/mocks";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { AppText } from "@/shared/components/ui/app-text";
import { useAppTheme } from "@/shared/lib/theme-context";

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

export default function ExpenseDetailScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const { transactionId } = useLocalSearchParams<{ transactionId?: string }>();
  const transaction = allTransactions.find((item) => item.id === transactionId);

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
        <View className="px-5 pt-5">
          <PersonScreenHeader backHref="/home-graphic" title="Detalle del gasto" />
          <View className="mt-8 rounded-[28px] border px-5 py-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <AppText className="text-[18px] font-bold" style={{ color: theme.text }}>
              No se ha encontrado este gasto
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const canRenderMap = Platform.OS !== "web" && Map && Camera && Marker && MAP_STYLE_URL;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-5"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <PersonScreenHeader backHref="/home-graphic" title="Detalle del gasto" />

        <View className="overflow-hidden rounded-[30px] border" style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}>
          <View className="h-[310px]" style={{ backgroundColor: theme.backgroundMuted }}>
            {canRenderMap ? (
              <Map
                attribution={false}
                compass={false}
                logo={false}
                mapStyle={MAP_STYLE_URL}
                scaleBar={false}
                style={{ flex: 1 }}
                touchPitch={false}
                touchRotate={false}
              >
                <Camera
                  initialViewState={{
                    center: [transaction.location.longitude, transaction.location.latitude],
                    pitch: 0,
                    zoom: 15,
                  }}
                  maxZoom={17}
                  minZoom={10}
                />
                <Marker
                  anchor="bottom"
                  id={`expense-detail-${transaction.id}`}
                  lngLat={[transaction.location.longitude, transaction.location.latitude]}
                >
                  <View className="items-center">
                    <View className="h-12 w-12 items-center justify-center rounded-full border-2" style={{ backgroundColor: theme.primary, borderColor: theme.backgroundElevated }}>
                      <MapPin color={theme.textOnPrimary} size={22} strokeWidth={2.4} />
                    </View>
                    <View
                      style={{
                        borderLeftColor: "transparent",
                        borderLeftWidth: 9,
                        borderRightColor: "transparent",
                        borderRightWidth: 9,
                        borderTopColor: theme.primary,
                        borderTopWidth: 12,
                        marginTop: -2,
                      }}
                    />
                  </View>
                </Marker>
              </Map>
            ) : (
              <View className="flex-1 items-center justify-center px-5">
                <MapPin color={theme.primary} size={34} strokeWidth={2.3} />
                <AppText className="mt-3 text-center text-[16px] font-bold" style={{ color: theme.text }}>
                  Mapa no disponible
                </AppText>
                <AppText className="mt-2 text-center text-[14px] leading-5" style={{ color: theme.mutedText }}>
                  Configura Stadia Maps o abre esta vista en iOS/Android para ver la ubicacion.
                </AppText>
              </View>
            )}
          </View>

          <View className="px-5 pb-5 pt-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <AppText className="text-[24px] font-black leading-[30px]" numberOfLines={2} style={{ color: theme.text }}>
                  {transaction.merchant}
                </AppText>
                <AppText className="mt-1 text-[15px] leading-6" numberOfLines={2} style={{ color: theme.mutedText }}>
                  {transaction.location.address}
                </AppText>
              </View>
              <View className="rounded-full px-3 py-2" style={{ backgroundColor: theme.primarySoft }}>
                <AppText className="text-[12px] font-black" style={{ color: theme.primary }}>
                  {transaction.category}
                </AppText>
              </View>
            </View>

            <View className="mt-5 rounded-[20px] px-4 py-4" style={{ backgroundColor: theme.background }}>
              <AppText
                adjustsFontSizeToFit
                className="text-[28px] font-black leading-[36px]"
                minimumFontScale={0.72}
                numberOfLines={1}
                style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
              >
                {transaction.amount}
              </AppText>
            </View>

            <View className="mt-5 gap-3">
              <DetailLine label="Fecha" value={transaction.detail.date} />
              <DetailLine label="Tarjeta" value={`**** ${transaction.detail.cardLastDigits}`} />
              <DetailLine label="Referencia" value={transaction.detail.reference} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-row items-center gap-2">
        {label === "Coordenadas" ? <Navigation color="#7c35e8" size={14} strokeWidth={2.2} /> : null}
        <AppText tone="muted" variant="caption">
          {label}
        </AppText>
      </View>
      <AppText className="flex-1 text-right text-[14px] font-bold" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}
