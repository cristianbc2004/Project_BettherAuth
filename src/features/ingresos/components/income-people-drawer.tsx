import { router } from "expo-router";
import { memo, useCallback } from "react";
import { FlatList, Modal, Pressable, Text, View, type ListRenderItem } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { mockIngresos, type IncomePerson } from "@/features/ingresos/services/income-mock";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type IncomePeopleDrawerProps = {
  email: string;
  isVisible: boolean;
  name: string;
  onClose: () => void;
  role: string;
};

type MockIncomePerson = (typeof mockIngresos.detalles)[number];

type IncomePersonRowProps = Pick<IncomePerson, "nombre"> & {
  onPress: () => void;
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

const IncomePersonRow = memo(function IncomePersonRow({ nombre, onPress }: IncomePersonRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`Ver información de ${nombre}`}
      accessibilityRole="button"
      className="flex-row items-center border-b py-5"
      onPress={onPress}
      style={{ borderColor: theme.border }}
    >
      <Text className="flex-1 text-[18px] font-bold" style={{ color: theme.text }}>
        {nombre}
      </Text>
      <View className="h-11 w-11 items-center justify-center">
        <Text className="text-2xl font-semibold" style={{ color: theme.text }}>
          {">"}
        </Text>
      </View>
    </Pressable>
  );
});

export function IncomePeopleDrawer({
  email,
  isVisible,
  name,
  onClose,
  role,
}: IncomePeopleDrawerProps) {
  const { theme } = useAppTheme();
  const handleOpenPerson = useCallback((personId: number) => {
    selectionHaptic();
    onClose();
    router.navigate(`/person/graphic?personId=${personId}` as never);
  }, [onClose]);
  const renderPerson: ListRenderItem<MockIncomePerson> = useCallback(
    ({ index, item }) => (
      <Animated.View
        entering={FadeInDown.duration(420)
          .delay(index * 90)
          .easing(Easing.out(Easing.quad))}
      >
        <IncomePersonRow nombre={item.nombre} onPress={() => handleOpenPerson(item.id)} />
      </Animated.View>
    ),
    [handleOpenPerson],
  );

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isVisible}>
      <View className="flex-1 flex-row" style={{ backgroundColor: "rgba(0, 0, 0, 0.42)" }}>
        <SafeAreaView className="h-full w-[88%]" style={{ backgroundColor: theme.background }}>
          <View className="flex-1 px-5 pb-10 pt-5">
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
                  <Text
                    className="text-[24px] font-bold"
                    numberOfLines={1}
                    style={{ color: theme.text }}
                  >
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
                className="ml-4 h-14 w-14 items-center justify-center"
                onPress={() => {
                  selectionHaptic();
                  onClose();
                }}
              >
                <Text className="text-3xl" style={{ color: theme.text }}>
                  x
                </Text>
              </Pressable>
            </View>

            <View className="mb-6 h-px" style={{ backgroundColor: theme.border }} />

            <Text className="mb-1 text-[20px] font-bold" style={{ color: theme.text }}>
              {mockIngresos.general.titulo}
            </Text>
            <Text className="mb-4 text-[15px]" style={{ color: theme.mutedText }}>
              {mockIngresos.general.periodo}
            </Text>

            <FlatList
              bounces={false}
              data={mockIngresos.detalles}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPerson}
              scrollEnabled={false}
            />
          </View>
        </SafeAreaView>

        <Pressable accessibilityLabel="Close menu overlay" className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}
