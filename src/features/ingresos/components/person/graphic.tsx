import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LineGraph, type GraphPoint } from "react-native-graph";

import { mockIngresos } from "@/features/ingresos/services/income-mock";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type SelectedPersonId = "all" | number;

type IncomeGraphPoint = GraphPoint & {
  month: string;
  person: string;
};

type PersonFilterProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

type GraphicProps = {
  initialSelectedPersonId?: number;
};

const graphColor = "#4484B2";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function PersonFilter({ isActive, label, onPress }: PersonFilterProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`Mostrar ingresos de ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="mr-3 rounded-full border px-4 py-3"
      onPress={onPress}
      style={{
        backgroundColor: isActive ? graphColor : theme.backgroundMuted,
        borderColor: isActive ? graphColor : theme.border,
      }}
    >
      <Text
        className="text-[14px] font-semibold"
        numberOfLines={1}
        style={{ color: isActive ? "#FFFFFF" : theme.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getPointDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function getMonthlyTotal(monthIndex: number) {
  return mockIngresos.grafica[monthIndex].ingresosPorPersona.reduce(
    (total, personIncome) => total + personIncome.ingresos,
    0,
  );
}

export function Graphic({ initialSelectedPersonId }: GraphicProps) {
  const { theme } = useAppTheme();
  const [selectedPersonId, setSelectedPersonId] = useState<SelectedPersonId>(
    initialSelectedPersonId ?? "all",
  );
  const [selectedPoint, setSelectedPoint] = useState<IncomeGraphPoint | null>(null);

  useEffect(() => {
    setSelectedPersonId(initialSelectedPersonId ?? "all");
    setSelectedPoint(null);
  }, [initialSelectedPersonId]);

  const selectedPersonName = useMemo(() => {
    if (selectedPersonId === "all") {
      return "Todos";
    }

    return mockIngresos.detalles.find((person) => person.id === selectedPersonId)?.nombre ?? "Todos";
  }, [selectedPersonId]);

  const priceHistory = useMemo<IncomeGraphPoint[]>(
    () =>
      mockIngresos.grafica.map((point, index) => {
        const personIncome =
          selectedPersonId === "all"
            ? null
            : point.ingresosPorPersona.find((income) => income.personaId === selectedPersonId);

        return {
          date: getPointDate(point.fecha),
          month: point.mes,
          person: personIncome?.persona ?? "Todos",
          value: personIncome?.ingresos ?? getMonthlyTotal(index),
        };
      }),
    [selectedPersonId],
  );

  const max = useMemo(
    () => priceHistory.reduce((currentMax, point) => (point.value > currentMax.value ? point : currentMax)),
    [priceHistory],
  );
  const min = useMemo(
    () => priceHistory.reduce((currentMin, point) => (point.value < currentMin.value ? point : currentMin)),
    [priceHistory],
  );
  const highlightedPoint = selectedPoint ?? priceHistory[priceHistory.length - 1];

  const handlePersonPress = useCallback((personId: SelectedPersonId) => {
    selectionHaptic();
    setSelectedPoint(null);
    setSelectedPersonId(personId);
  }, []);

  const handlePointSelected = useCallback(
    (point: GraphPoint) => {
      const matchingPoint = priceHistory.find(
        (item) => item.date.getTime() === point.date.getTime() && item.value === point.value,
      );

      setSelectedPoint(matchingPoint ?? null);
    },
    [priceHistory],
  );

  const handleGestureStart = useCallback(() => {
    selectionHaptic();
  }, []);

  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  return (
    <GestureHandlerRootView className="mt-6">
      <Text className="text-[13px] font-semibold uppercase tracking-[1.3px]" style={{ color: theme.mutedText }}>
        Ingresos por mes
      </Text>
      <Text className="mt-2 text-[28px] font-bold" style={{ color: theme.text }}>
        {formatCurrency(highlightedPoint.value)}
      </Text>
      <Text className="mt-1 text-[16px]" style={{ color: theme.mutedText }}>
        {selectedPersonName} - {highlightedPoint.month}
      </Text>

      <View className="mt-5 flex-row items-center justify-between gap-4 px-1">
        <View className="flex-1">
          <Text className="text-[11px] font-black uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>
            Minimo
          </Text>
          <Text className="mt-1 text-[16px] font-black" style={{ color: theme.text }}>
            {formatCurrency(min.value)}
          </Text>
          <Text className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
            {min.month}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-[11px] font-black uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>
            Maximo
          </Text>
          <Text className="mt-1 text-[16px] font-black" style={{ color: theme.text }}>
            {formatCurrency(max.value)}
          </Text>
          <Text className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
            {max.month}
          </Text>
        </View>
      </View>

      <ScrollView
        className="mt-5"
        contentContainerClassName="pr-2"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PersonFilter
          isActive={selectedPersonId === "all"}
          label="Todos"
          onPress={() => handlePersonPress("all")}
        />
        {mockIngresos.detalles.map((person) => (
          <PersonFilter
            isActive={selectedPersonId === person.id}
            key={person.id}
            label={person.nombre}
            onPress={() => handlePersonPress(person.id)}
          />
        ))}
      </ScrollView>

      <View className="mt-6 h-[280px]">
        <LineGraph
          animated={true}
          color={graphColor}
          enablePanGesture={true}
          gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
          horizontalPadding={16}
          lineThickness={4}
          onGestureEnd={handleGestureEnd}
          onGestureStart={handleGestureStart}
          onPointSelected={handlePointSelected}
          panGestureDelay={80}
          points={priceHistory}
          style={{ flex: 1 }}
          verticalPadding={24}
        />
      </View>
    </GestureHandlerRootView>
  );
}
