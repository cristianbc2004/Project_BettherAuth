import * as Location from "expo-location";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { HomeHeader } from "@/features/places/components/home-header";
import { NearbyPlacesDrawer } from "@/features/places/components/nearby-places-drawer";
import {
  fallbackLocation,
  fetchNearbyFoodPlaces,
  type NearbyPlace,
  type UserLocation,
} from "@/features/places/services/nearby-places";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function HomeScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyPlace[]>([]);
  const [restaurantsError, setRestaurantsError] = useState<string | null>(null);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [usesFallbackLocation, setUsesFallbackLocation] = useState(true);
  const { theme } = useAppTheme();

  useEffect(() => {
    let isActive = true;

    const loadNearbyRestaurants = async () => {
      if (!session?.user || showSessionLoading) {
        return;
      }

      try {
        setRestaurantsError(null);
        setRestaurantsLoading(true);

        const permission = await Location.requestForegroundPermissionsAsync();
        let searchLocation: UserLocation = fallbackLocation;
        let shouldUseFallback = true;

        if (permission.status === Location.PermissionStatus.GRANTED) {
          const currentPosition = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          searchLocation = {
            latitude: currentPosition.coords.latitude,
            longitude: currentPosition.coords.longitude,
          };
          shouldUseFallback = false;
        }

        const restaurants = await fetchNearbyFoodPlaces(searchLocation);

        if (!isActive) {
          return;
        }

        setNearbyRestaurants(restaurants);
        setUsesFallbackLocation(shouldUseFallback);
      } catch {
        if (!isActive) {
          return;
        }

        setRestaurantsError("No pudimos cargar restaurantes reales cerca.");
      } finally {
        if (isActive) {
          setRestaurantsLoading(false);
        }
      }
    };

    void loadNearbyRestaurants();

    return () => {
      isActive = false;
    };
  }, [session?.user, showSessionLoading]);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const role = (session.user as { role?: string }).role ?? "Usuario";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <View className="flex-1 px-5 pb-8 pt-5">
        <HomeHeader
          onOpenMenu={() => {
            selectionHaptic();
            setIsDrawerOpen(true);
          }}
          onOpenNotifications={() => {
            selectionHaptic();
            router.navigate("/notifications" as never);
          }}
        />

        <View className="flex-1 justify-center">
          <Animated.View
            className="rounded-[32px] border px-6 py-7"
            entering={FadeInDown.duration(520).easing(Easing.out(Easing.quad))}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <Text className="text-[28px] font-bold" style={{ color: theme.text }}>
              Hola, {session.user.name.split(" ")[0] || session.user.name}
            </Text>
            <Text className="mt-3 text-[16px] leading-6" style={{ color: theme.mutedText }}>
              Todo listo por ahora.
            </Text>
          </Animated.View>
        </View>
      </View>

      <NearbyPlacesDrawer
        email={session.user.email}
        isVisible={isDrawerOpen}
        name={session.user.name}
        onClose={() => setIsDrawerOpen(false)}
        restaurants={nearbyRestaurants}
        restaurantsError={restaurantsError}
        restaurantsLoading={restaurantsLoading}
        role={role}
        usesFallbackLocation={usesFallbackLocation}
      />
    </SafeAreaView>
  );
}
