import { router } from "expo-router";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NearbyPlace } from "@/features/places/services/nearby-places";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type NearbyPlacesDrawerProps = {
  email: string;
  isVisible: boolean;
  name: string;
  onClose: () => void;
  restaurants: NearbyPlace[];
  restaurantsError: string | null;
  restaurantsLoading: boolean;
  role: string;
  usesFallbackLocation: boolean;
};

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "BA";
}

function NearbyPlaceRow({ distanceLabel, featured, name, speciality }: NearbyPlace) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center border-b py-5"
      onPress={selectionHaptic}
      style={{ borderColor: theme.border }}
    >
      <View
        className="mr-4 h-16 w-1.5 rounded-full"
        style={{ backgroundColor: featured ? theme.success : "transparent" }}
      />
      <View className="flex-1">
        <Text
          className="text-[18px] font-bold"
          style={{ color: featured ? theme.success : theme.text }}
        >
          {name}
        </Text>
        <View className="mt-2 flex-row items-center">
          <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: theme.success }} />
          <Text className="text-[15px]" style={{ color: theme.mutedText }}>
            {distanceLabel} | {speciality}
          </Text>
        </View>
      </View>
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: featured ? theme.primarySoft : theme.backgroundMuted }}
      >
        <Text className="text-2xl font-semibold" style={{ color: theme.text }}>
          {">"}
        </Text>
      </View>
    </Pressable>
  );
}

export function NearbyPlacesDrawer({
  email,
  isVisible,
  name,
  onClose,
  restaurants,
  restaurantsError,
  restaurantsLoading,
  role,
  usesFallbackLocation,
}: NearbyPlacesDrawerProps) {
  const { theme } = useAppTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isVisible}>
      <View className="flex-1 flex-row" style={{ backgroundColor: "rgba(0, 0, 0, 0.42)" }}>
        <SafeAreaView
          className="h-full w-[88%]"
          style={{ backgroundColor: theme.background }}
        >
          <ScrollView
            bounces={false}
            contentContainerClassName="px-5 pb-10 pt-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-7 flex-row items-center justify-between">
              <Pressable
                accessibilityLabel="Open account"
                accessibilityRole="button"
                className="flex-1 flex-row items-center"
                onPress={() => {
                  selectionHaptic();
                  onClose();
                  router.navigate("/dashboard" as never);
                }}
              >
                <View
                  className="mr-4 h-20 w-20 items-center justify-center rounded-[28px] border"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }}
                >
                  <Text className="text-[22px] font-bold" style={{ color: theme.text }}>
                    {getInitials(name)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[24px] font-bold" numberOfLines={1} style={{ color: theme.text }}>
                    {name}
                  </Text>
                  <Text className="mt-1 text-[16px] font-semibold" style={{ color: theme.mutedText }}>
                    {role}
                  </Text>
                  <Text className="mt-1 text-xs" numberOfLines={1} style={{ color: theme.mutedText }}>
                    {email}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityLabel="Close menu"
                accessibilityRole="button"
                className="ml-4 h-14 w-14 items-center justify-center rounded-[22px] border"
                onPress={() => {
                  selectionHaptic();
                  onClose();
                }}
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <Text className="text-3xl" style={{ color: theme.text }}>
                  x
                </Text>
              </Pressable>
            </View>

            <View className="mb-6 h-px" style={{ backgroundColor: theme.border }} />

            <Text className="mb-4 text-[20px] font-bold" style={{ color: theme.text }}>
              Restaurantes cerca
            </Text>
            <View
              className="mb-8 flex-row items-center rounded-[24px] px-5 py-4"
              style={{ backgroundColor: theme.backgroundMuted }}
            >
              <Text className="mr-4 text-[24px]" style={{ color: theme.mutedText }}>
                ?
              </Text>
              <Text className="flex-1 text-[17px]" style={{ color: theme.mutedText }}>
                Buscar restaurantes...
              </Text>
            </View>
            {usesFallbackLocation ? (
              <Text className="-mt-5 mb-5 px-1 text-sm" style={{ color: theme.mutedText }}>
                Activa la ubicacion para ordenar los restaurantes cerca de ti.
              </Text>
            ) : null}
            {restaurantsLoading ? (
              <Text className="px-1 py-5 text-[16px]" style={{ color: theme.mutedText }}>
                Buscando restaurantes cerca...
              </Text>
            ) : null}
            {restaurantsError ? (
              <Text className="px-1 py-5 text-[16px]" style={{ color: theme.danger }}>
                {restaurantsError}
              </Text>
            ) : null}
            {!restaurantsLoading && !restaurantsError && restaurants.length === 0 ? (
              <Text className="px-1 py-5 text-[16px]" style={{ color: theme.mutedText }}>
                No encontramos restaurantes cerca.
              </Text>
            ) : null}

            {restaurants.map((place, index) => (
              <Animated.View
                entering={FadeInDown.duration(420)
                  .delay(index * 90)
                  .easing(Easing.out(Easing.quad))}
                key={place.id}
              >
                <NearbyPlaceRow {...place} />
              </Animated.View>
            ))}
          </ScrollView>
        </SafeAreaView>

        <Pressable accessibilityLabel="Close menu overlay" className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}
