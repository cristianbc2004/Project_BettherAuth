import { useId, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

export type NativeLineChartPoint = {
  date: Date;
  value: number;
};

type NativeLineChartProps<TPoint extends NativeLineChartPoint> = {
  color: string;
  enablePanGesture?: boolean;
  gradientFillColors?: [string, string];
  height?: number;
  horizontalPadding?: number;
  lineThickness?: number;
  onGestureEnd?: () => void;
  onGestureStart?: () => void;
  onPointSelected?: (point: TPoint) => void;
  onPress?: () => void;
  points: TPoint[];
  style?: ViewStyle;
  tapMaxDurationMs?: number;
  tapMoveThreshold?: number;
  verticalPadding?: number;
};

type ChartCoordinate = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildLinePath(coordinates: ChartCoordinate[]) {
  return coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(coordinates: ChartCoordinate[], baselineY: number) {
  if (coordinates.length === 0) {
    return "";
  }

  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];

  return [
    `M ${firstPoint.x} ${baselineY}`,
    `L ${firstPoint.x} ${firstPoint.y}`,
    ...coordinates.slice(1).map((point) => `L ${point.x} ${point.y}`),
    `L ${lastPoint.x} ${baselineY}`,
    "Z",
  ].join(" ");
}

function findNearestCoordinateIndex(coordinates: ChartCoordinate[], x: number) {
  return coordinates.reduce((closestIndex, coordinate, index) => {
    const closest = coordinates[closestIndex];
    return Math.abs(coordinate.x - x) < Math.abs(closest.x - x) ? index : closestIndex;
  }, 0);
}

export function NativeLineChart<TPoint extends NativeLineChartPoint>({
  color,
  enablePanGesture = true,
  gradientFillColors,
  height = 220,
  horizontalPadding = 16,
  lineThickness = 4,
  onGestureEnd,
  onGestureStart,
  onPointSelected,
  onPress,
  points,
  style,
  tapMaxDurationMs = 250,
  tapMoveThreshold = 8,
  verticalPadding = 20,
}: NativeLineChartProps<TPoint>) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gestureStartRef = useRef<{ moved: boolean; startedAt: number; x: number; y: number } | null>(null);
  const isInteractingRef = useRef(false);
  const gradientId = `lineChartGradient${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const chart = useMemo(() => {
    const safeWidth = Math.max(width, 1);
    const chartWidth = Math.max(safeWidth - horizontalPadding * 2, 1);
    const chartHeight = Math.max(height - verticalPadding * 2, 1);
    const values = points.map((point) => point.value);
    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 0;
    const valueRange = Math.max(maxValue - minValue, 1);
    const lastIndex = Math.max(points.length - 1, 1);
    const coordinates = points.map((point, index) => {
      const x = horizontalPadding + (chartWidth * index) / lastIndex;
      const normalizedValue = (point.value - minValue) / valueRange;
      const y = verticalPadding + chartHeight - normalizedValue * chartHeight;

      return { x, y };
    });

    return {
      areaPath: buildAreaPath(coordinates, height - verticalPadding),
      coordinates,
      linePath: buildLinePath(coordinates),
    };
  }, [height, horizontalPadding, points, verticalPadding, width]);

  const selectNearestPoint = (x: number) => {
    if (chart.coordinates.length === 0) {
      return;
    }

    const nearestIndex = findNearestCoordinateIndex(chart.coordinates, clamp(x, 0, width));
    setActiveIndex(nearestIndex);
    onPointSelected?.(points[nearestIndex]);
  };

  const endInteraction = () => {
    if (isInteractingRef.current) {
      isInteractingRef.current = false;
      onGestureEnd?.();
    }

    setActiveIndex(null);
  };

  const handleGestureStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    gestureStartRef.current = {
      moved: false,
      startedAt: Date.now(),
      x: locationX,
      y: locationY,
    };
  };

  const handleGestureMove = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (!enablePanGesture) {
      return;
    }

    const gestureStart = gestureStartRef.current;

    if (!gestureStart) {
      return;
    }

    const movedFarEnough = Math.hypot(gestureState.dx, gestureState.dy) > tapMoveThreshold;

    if (movedFarEnough) {
      gestureStart.moved = true;
    }

    if (!isInteractingRef.current && gestureStart.moved) {
      isInteractingRef.current = true;
      onGestureStart?.();
    }

    if (gestureStart.moved) {
      selectNearestPoint(event.nativeEvent.locationX);
    }
  };

  const handleGestureEnd = (event: GestureResponderEvent) => {
    const gestureStart = gestureStartRef.current;
    gestureStartRef.current = null;

    if (!gestureStart) {
      endInteraction();
      return;
    }

    const isTap = !gestureStart.moved && Date.now() - gestureStart.startedAt < tapMaxDurationMs;

    if (isTap) {
      onPress?.();
    }

    endInteraction();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          enablePanGesture && Math.hypot(gestureState.dx, gestureState.dy) > tapMoveThreshold,
        onPanResponderGrant: handleGestureStart,
        onPanResponderMove: handleGestureMove,
        onPanResponderRelease: handleGestureEnd,
        onPanResponderTerminate: () => {
          gestureStartRef.current = null;
          endInteraction();
        },
        onStartShouldSetPanResponder: () => true,
      }),
    [chart.coordinates, enablePanGesture, onGestureEnd, onGestureStart, onPointSelected, onPress, points, width],
  );

  const activeCoordinate = activeIndex === null ? null : chart.coordinates[activeIndex];
  const gradientStart = gradientFillColors?.[0] ?? `${color}55`;
  const gradientEnd = gradientFillColors?.[1] ?? `${color}00`;

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.container, { height }, style]}
      {...panResponder.panHandlers}
    >
      {width > 0 ? (
        <Svg height={height} width={width}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={gradientStart} />
              <Stop offset="1" stopColor={gradientEnd} />
            </LinearGradient>
          </Defs>
          {chart.areaPath ? <Path d={chart.areaPath} fill={`url(#${gradientId})`} /> : null}
          {chart.linePath ? (
            <Path
              d={chart.linePath}
              fill="none"
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={lineThickness}
            />
          ) : null}
          {activeCoordinate ? (
            <>
              <Path
                d={`M ${activeCoordinate.x} ${verticalPadding} L ${activeCoordinate.x} ${height - verticalPadding}`}
                stroke={color}
                strokeOpacity={0.24}
                strokeWidth={1}
              />
              <Circle cx={activeCoordinate.x} cy={activeCoordinate.y} fill={color} r={6} />
              <Circle cx={activeCoordinate.x} cy={activeCoordinate.y} fill="transparent" r={11} stroke={color} strokeWidth={2} />
            </>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
  },
});
