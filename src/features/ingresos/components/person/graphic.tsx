import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { mockIngresos } from "@/features/ingresos/mocks";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { NativeLineChart, type NativeLineChartPoint } from "@/shared/components/ui/native-line-chart";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

type SelectedPersonId = "all" | number;

type IncomeGraphPoint = NativeLineChartPoint & {
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
  onGraphInteractionChange?: (isInteracting: boolean) => void;
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
      <AppText
        className="text-[14px] font-semibold"
        numberOfLines={1}
        style={{ color: isActive ? "#FFFFFF" : theme.text }}
      >
        {label}
      </AppText>
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

export function Graphic({ initialSelectedPersonId, onGraphInteractionChange }: GraphicProps) {
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

  const handlePointSelected = useCallback((point: IncomeGraphPoint) => {
    setSelectedPoint(point);
  }, []);

  const handleGestureStart = useCallback(() => {
    selectionHaptic();
    onGraphInteractionChange?.(true);
  }, [onGraphInteractionChange]);

  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
    onGraphInteractionChange?.(false);
  }, [onGraphInteractionChange]);

  return (
    <View className="mt-6">
      <AppText className="text-[13px] font-semibold uppercase tracking-[1.3px]" style={{ color: theme.mutedText }}>
        Ingresos por mes
      </AppText>
      <AnimatedNumber
        animateOnMount={true}
        className="mt-2 text-[26px] font-bold"
        formatValue={(nextValue) => formatCurrency(Math.round(nextValue))}
        style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
        value={highlightedPoint.value}
      />
      <AppText className="mt-1 text-[14px]" style={{ color: theme.mutedText }}>
        {selectedPersonName} - {highlightedPoint.month}
      </AppText>

      <View className="mt-5 flex-row items-center justify-between gap-4 px-1">
        <View className="flex-1">
          <AppText className="text-[11px] font-black uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>
            Minimo
          </AppText>
          <AppText className="mt-1 text-[16px] font-black" style={{ color: theme.text }}>
            {formatCurrency(min.value)}
          </AppText>
          <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
            {min.month}
          </AppText>
        </View>

        <View className="flex-1 items-end">
          <AppText className="text-[11px] font-black uppercase tracking-[1.6px]" style={{ color: theme.mutedText }}>
            Maximo
          </AppText>
          <AppText className="mt-1 text-[16px] font-black" style={{ color: theme.text }}>
            {formatCurrency(max.value)}
          </AppText>
          <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
            {max.month}
          </AppText>
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

      <View className="mt-5 h-[240px]">
        <NativeLineChart
          color={graphColor}
          enablePanGesture={true}
          gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
          height={240}
          horizontalPadding={16}
          lineThickness={4}
          onGestureEnd={handleGestureEnd}
          onGestureStart={handleGestureStart}
          onPointSelected={handlePointSelected}
          panGestureDelay={80}
          points={priceHistory}
          verticalPadding={24}
        />
      </View>
    </View>
  );
}
