import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { mockIngresos } from "@/features/ingresos/mocks";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { NativeLineChart, type NativeLineChartPoint } from "@/shared/components/ui/native-line-chart";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

type SelectedPersonId = "all" | number;
type IncomeGraphTab = "chart" | "detail";

type IncomeGraphPoint = NativeLineChartPoint & {
  month: string;
  person: string;
};

type PersonFilterProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

type GraphTabButtonProps = {
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
      className="min-w-[104px] rounded-xl border px-4 py-3"
      onPress={onPress}
      style={{
        backgroundColor: isActive ? theme.primary : theme.backgroundElevated,
        borderColor: isActive ? theme.primary : theme.border,
      }}
    >
      <AppText
        className="text-center text-[14px] font-semibold leading-5"
        numberOfLines={1}
        style={{ color: isActive ? theme.textOnPrimary : theme.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function GraphTabButton({ isActive, label, onPress }: GraphTabButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      className="flex-1 rounded-xl px-4 py-3"
      onPress={onPress}
      style={{
        backgroundColor: isActive ? theme.backgroundElevated : "transparent",
        borderColor: isActive ? theme.border : "transparent",
        borderWidth: 1,
      }}
    >
      <AppText
        className="text-center text-[14px] font-black leading-5"
        style={{ color: isActive ? theme.text : theme.mutedText }}
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
  const [selectedTab, setSelectedTab] = useState<IncomeGraphTab>("chart");
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

  const highlightedPoint = selectedPoint ?? priceHistory[priceHistory.length - 1];
  const highlightedPointIndex = Math.max(
    priceHistory.findIndex((point) => point.date.getTime() === highlightedPoint.date.getTime()),
    0,
  );
  const comparisonPoint = priceHistory[Math.max(highlightedPointIndex - 1, 0)];
  const totalIncome = mockIngresos.detalles.reduce((total, person) => total + person.ingresos, 0);
  const rangeSummary = `${mockIngresos.general.periodo} - ${priceHistory[0].month} - ${priceHistory[priceHistory.length - 1].month}`;
  const previousPeriodDelta = highlightedPoint.value - comparisonPoint.value;
  const isPositiveDelta = previousPeriodDelta >= 0;
  const deltaTextColor = isPositiveDelta ? theme.success : theme.danger;
  const deltaBackgroundColor = isPositiveDelta ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)";
  const deltaDirection = isPositiveDelta ? "\u25B3" : "\u25BD";

  const workerDetails = useMemo(() => {
    if (selectedPersonId === "all") {
      return [...mockIngresos.detalles].sort((first, second) => second.ingresos - first.ingresos);
    }

    return mockIngresos.detalles.filter((person) => person.id === selectedPersonId);
  }, [selectedPersonId]);

  const handlePersonPress = useCallback((personId: SelectedPersonId) => {
    selectionHaptic();
    setSelectedPoint(null);
    setSelectedPersonId(personId);
  }, []);

  const handleTabPress = useCallback((tab: IncomeGraphTab) => {
    selectionHaptic();
    setSelectedTab(tab);
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
      <AppText className="text-[12px] font-black uppercase tracking-[1.4px]" style={{ color: theme.mutedText }}>
        Rango
      </AppText>
      <AppText className="mt-1 text-[14px] font-semibold leading-5" style={{ color: theme.mutedText }}>
        {rangeSummary}
      </AppText>

      <View className="mt-4 flex-row items-end justify-between gap-4">
        <View className="flex-1">
          <AppText className="text-[13px] font-semibold leading-5" style={{ color: theme.mutedText }}>
            Ingresos
          </AppText>
          <AnimatedNumber
            animateOnMount={true}
            className="mt-1 text-[34px] font-black leading-[42px]"
            formatValue={(nextValue) => formatCurrency(Math.round(nextValue))}
            style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
            value={highlightedPoint.value}
          />
        </View>

        <View className="mb-1 rounded-full px-3 py-2" style={{ backgroundColor: deltaBackgroundColor }}>
          <AppText className="text-[15px] font-black leading-5" style={{ color: deltaTextColor, fontVariant: ["tabular-nums"] }}>
            {deltaDirection} {formatCurrency(Math.abs(previousPeriodDelta))}
          </AppText>
        </View>
      </View>

      <AppText className="mt-1 text-[14px] leading-5" numberOfLines={2} style={{ color: theme.mutedText }}>
        Ingresos de {selectedPersonName} en {highlightedPoint.month}
      </AppText>
        
      <View className="mt-6">

        <View className="mt-5 h-[260px]">
          <NativeLineChart
            color={graphColor}
            enablePanGesture={true}
            gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
            height={260}
            horizontalPadding={12}
            lineThickness={4}
            onGestureEnd={handleGestureEnd}
            onGestureStart={handleGestureStart}
            onPointSelected={handlePointSelected}
            panGestureDelay={40}
            points={priceHistory}
            verticalPadding={24}
          />
        </View>
      </View>

      <View className="mt-6 border-t pt-5" style={{ borderColor: theme.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3 pr-2">
            
            {mockIngresos.detalles.map((person) => (
              <PersonFilter
                isActive={selectedPersonId === person.id}
                key={person.id}
                label={person.nombre}
                onPress={() => handlePersonPress(person.id)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
