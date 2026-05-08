import { Redirect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { authClient } from "@/features/auth/services/auth-client";
import { weeklyBalance } from "@/features/finance/mocks";
import { PersonScreenHeader } from "@/features/ingresos/components/person-screen-header";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { NativeLineChart, type NativeLineChartPoint } from "@/shared/components/ui/native-line-chart";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type HomeGraphFilter = "3d" | "1m" | "3m" | "custom";

type HomeGraphPoint = NativeLineChartPoint & {
  label: string;
};

type DateRange = {
  end: Date;
  start: Date;
};

type FilterChipProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

function FilterChip({ isActive, label, onPress }: FilterChipProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="min-w-[74px] rounded-xl border px-4 py-3"
      onPress={onPress}
      style={{
        backgroundColor: isActive ? theme.primary : theme.backgroundElevated,
        borderColor: isActive ? theme.primary : theme.border,
      }}
    >
      <Text
        className="text-center text-[14px] font-semibold"
        style={{ color: isActive ? theme.textOnPrimary : theme.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(value);
}

function formatInputDate(value: Date) {
  const day = value.getDate().toString().padStart(2, "0");
  const month = (value.getMonth() + 1).toString().padStart(2, "0");
  const year = value.getFullYear().toString();
  return `${day}/${month}/${year}`;
}

function parseInputDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

function buildHistory() {
  const totalDays = 45;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const source = weeklyBalance[index % weeklyBalance.length];
    const date = new Date(today);
    date.setDate(today.getDate() - (totalDays - index - 1));
    const noise = Math.round(Math.sin(index * 0.6) * 230);

    return {
      date,
      label: formatDateLabel(date),
      value: source.value + noise,
    } satisfies HomeGraphPoint;
  });
}

function getSelectedRangeLabel(points: HomeGraphPoint[]) {
  if (points.length === 0) {
    return "Sin datos";
  }

  const start = points[0].date;
  const end = points[points.length - 1].date;
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  if (days === 1) {
    return `${formatDateLabel(start)} (1 dia)`;
  }

  return `${formatDateLabel(start)} - ${formatDateLabel(end)} (${days} dias)`;
}

export default function HomeGraphicScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { resolvedThemeName, theme } = useAppTheme();
  const graphColor = resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
  const allPoints = useMemo<HomeGraphPoint[]>(() => buildHistory(), []);
  const [selectedFilter, setSelectedFilter] = useState<HomeGraphFilter>("3d");
  const [selectedPoint, setSelectedPoint] = useState<HomeGraphPoint | null>(null);
  const [isChartInteracting, setIsChartInteracting] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState<DateRange>(() => {
    const end = allPoints[allPoints.length - 1].date;
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { start, end };
  });
  const [startInput, setStartInput] = useState(() => formatInputDate(customRange.start));
  const [endInput, setEndInput] = useState(() => formatInputDate(customRange.end));

  const filteredPoints = useMemo(() => {
    if (selectedFilter === "custom") {
      return allPoints.filter((point) => point.date >= customRange.start && point.date <= customRange.end);
    }

    const sizeByFilter: Record<Exclude<HomeGraphFilter, "custom">, number> = {
      "3d": 3,
      "1m": 30,
      "3m": 90,
    };

    const size = sizeByFilter[selectedFilter];
    return allPoints.slice(-size);
  }, [allPoints, customRange.end, customRange.start, selectedFilter]);
  const graphPoints = useMemo(() => {
    if (filteredPoints.length !== 1) {
      return filteredPoints;
    }

    const onlyPoint = filteredPoints[0];
    const syntheticDate = new Date(onlyPoint.date);
    syntheticDate.setMinutes(syntheticDate.getMinutes() + 1);

    return [
      onlyPoint,
      {
        ...onlyPoint,
        date: syntheticDate,
      },
    ];
  }, [filteredPoints]);
  const isGraphInteractive = filteredPoints.length > 1;

  const highlightedPoint = selectedPoint ?? filteredPoints[filteredPoints.length - 1] ?? allPoints[allPoints.length - 1];
  const rangeSummary = getSelectedRangeLabel(filteredPoints);
  const values = filteredPoints.map((point) => point.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const averageValue = values.length ? Math.round(values.reduce((acc, value) => acc + value, 0) / values.length) : 0;

  const handleFilterPress = useCallback((filter: HomeGraphFilter) => {
    selectionHaptic();
    setSelectedPoint(null);
    setSelectedFilter(filter);
  }, []);

  const handlePointSelected = useCallback((point: HomeGraphPoint) => {
    setSelectedPoint(point);
  }, []);

  const handleGestureStart = useCallback(() => {
    selectionHaptic();
    setIsChartInteracting(true);
  }, []);

  const handleGestureEnd = useCallback(() => {
    setIsChartInteracting(false);
  }, []);

  const openCustomModal = useCallback(() => {
    selectionHaptic();
    setRangeError(null);
    setStartInput(formatInputDate(customRange.start));
    setEndInput(formatInputDate(customRange.end));
    setIsCustomModalOpen(true);
  }, [customRange.end, customRange.start]);

  const applyCustomRange = useCallback(() => {
    const parsedStart = parseInputDate(startInput);
    const parsedEnd = parseInputDate(endInput);

    if (!parsedStart || !parsedEnd) {
      setRangeError("Usa el formato DD/MM/AAAA.");
      return;
    }

    if (parsedStart > parsedEnd) {
      setRangeError("La fecha de inicio no puede ser mayor que la de fin.");
      return;
    }

    const dataStart = allPoints[0].date;
    const dataEnd = allPoints[allPoints.length - 1].date;

    if (parsedStart < dataStart || parsedEnd > dataEnd) {
      setRangeError(`El rango debe estar entre ${formatInputDate(dataStart)} y ${formatInputDate(dataEnd)}.`);
      return;
    }

    selectionHaptic();
    setRangeError(null);
    setCustomRange({ end: parsedEnd, start: parsedStart });
    setSelectedPoint(null);
    setSelectedFilter("custom");
    setIsCustomModalOpen(false);
  }, [allPoints, endInput, startInput]);

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-20 pt-20"
        contentInsetAdjustmentBehavior="automatic"
        scrollEnabled={!isChartInteracting}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <PersonScreenHeader backHref="/home" title="Grafica de balance" />

        <View className="mt-7">
          <View className="flex-row flex-wrap items-center gap-3">
            <FilterChip
              isActive={selectedFilter === "3d"}
              label="3 dias"
              onPress={() => handleFilterPress("3d")}
            />
            <FilterChip
              isActive={selectedFilter === "1m"}
              label="1 mes"
              onPress={() => handleFilterPress("1m")}
            />
            <FilterChip
              isActive={selectedFilter === "3m"}
              label="3 meses"
              onPress={() => handleFilterPress("3m")}
            />
            <Pressable
              accessibilityRole="button"
              className="rounded-xl border px-4 py-3"
              onPress={openCustomModal}
              style={{
                backgroundColor: selectedFilter === "custom" ? theme.primarySoft : theme.backgroundElevated,
                borderColor: selectedFilter === "custom" ? theme.primary : theme.border,
              }}
            >
              <Text className="text-[14px] font-semibold" style={{ color: theme.text }}>
                Rango personalizado
              </Text>
            </Pressable>
          </View>

          <Text className="mt-4 text-[14px] font-semibold" style={{ color: theme.mutedText }}>
            Rango activo: {rangeSummary}
          </Text>

          <AnimatedNumber
            animateOnMount={true}
            className="mt-2 text-[36px] font-black"
            formatValue={(nextValue) => formatCurrency(Math.round(nextValue))}
            style={{ color: theme.text, fontVariant: ["tabular-nums"] }}
            value={highlightedPoint.value}
          />
          <Text className="mt-1 text-[14px]" style={{ color: theme.mutedText }}>
            Balance en {highlightedPoint.label}
          </Text>

          <View className="mt-5">
            <View className="h-[220px]">
              <NativeLineChart
                color={graphColor}
                enablePanGesture={isGraphInteractive}
                gradientFillColors={[`${graphColor}66`, `${graphColor}10`]}
                height={220}
                horizontalPadding={16}
                lineThickness={4}
                onGestureEnd={handleGestureEnd}
                onGestureStart={handleGestureStart}
                onPointSelected={handlePointSelected}
                points={graphPoints}
                verticalPadding={20}
              />
            </View>
          </View>
        </View>

        <View className="mt-6 border-t pt-6" style={{ borderColor: theme.border }}>
          <Text className="text-[28px] font-black" style={{ color: theme.text }}>
            Datos
          </Text>
          <Text className="mt-3 text-[16px]" style={{ color: theme.mutedText }}>
            Minimo: {formatCurrency(minValue)}
          </Text>
          <Text className="mt-1 text-[16px]" style={{ color: theme.mutedText }}>
            Maximo: {formatCurrency(maxValue)}
          </Text>
          <Text className="mt-1 text-[16px]" style={{ color: theme.mutedText }}>
            Promedio: {formatCurrency(averageValue)}
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsCustomModalOpen(false)}
        transparent={true}
        visible={isCustomModalOpen}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 items-center justify-center px-6"
        >
          <Pressable
            className="absolute inset-0"
            onPress={() => setIsCustomModalOpen(false)}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
          />

          <View
            className="w-full max-w-[360px] rounded-2xl border p-5"
            style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}
          >
            <Text className="text-[20px] font-black" style={{ color: theme.text }}>
              Rango personalizado
            </Text>

            <View className="mt-4 gap-4">
              <View>
                <Text className="mb-2 text-[13px] font-semibold" style={{ color: theme.mutedText }}>
                  Inicio
                </Text>
                <TextInput
                  autoCapitalize="none"
                  className="rounded-xl border px-4 py-3 text-[15px]"
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setStartInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={theme.mutedText}
                  style={{ borderColor: theme.inputBorder, color: theme.text }}
                  value={startInput}
                />
              </View>

              <View>
                <Text className="mb-2 text-[13px] font-semibold" style={{ color: theme.mutedText }}>
                  Fin
                </Text>
                <TextInput
                  autoCapitalize="none"
                  className="rounded-xl border px-4 py-3 text-[15px]"
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEndInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={theme.mutedText}
                  style={{ borderColor: theme.inputBorder, color: theme.text }}
                  value={endInput}
                />
              </View>
            </View>

            {rangeError ? (
              <Text className="mt-3 text-[13px] font-medium" style={{ color: theme.danger }}>
                {rangeError}
              </Text>
            ) : null}

            <View className="mt-6 flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl border px-4 py-3"
                onPress={() => setIsCustomModalOpen(false)}
                style={{ borderColor: theme.border }}
              >
                <Text className="text-[14px] font-semibold" style={{ color: theme.text }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                className="rounded-xl px-4 py-3"
                onPress={applyCustomRange}
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-[14px] font-semibold" style={{ color: theme.textOnPrimary }}>
                  Aplicar
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
