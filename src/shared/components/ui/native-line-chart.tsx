import { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type ViewStyle,
} from "react-native";
import { Canvas, Circle, LinearGradient, Line, Path, vec } from "@shopify/react-native-skia";

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
  panGestureDelay?: number;
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

type ChartSelection<TPoint extends NativeLineChartPoint> = {
  coordinate: ChartCoordinate;
  point: TPoint;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function cubicAt(start: number, controlA: number, controlB: number, end: number, progress: number) {
  const inverseProgress = 1 - progress;

  return (
    inverseProgress ** 3 * start +
    3 * inverseProgress ** 2 * progress * controlA +
    3 * inverseProgress * progress ** 2 * controlB +
    progress ** 3 * end
  );
}

function findCubicProgressForX(startX: number, controlX: number, endX: number, targetX: number) {
  let low = 0;
  let high = 1;

  for (let index = 0; index < 12; index += 1) {
    const middle = (low + high) / 2;
    const x = cubicAt(startX, controlX, controlX, endX, middle);

    if (x < targetX) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}

function buildLinePath(coordinates: ChartCoordinate[]) {
  if (coordinates.length === 0) {
    return "";
  }

  if (coordinates.length === 1) {
    return `M ${coordinates[0].x} ${coordinates[0].y}`;
  }

  // SVG paths use commands like "M x y" to move and "L x y" to draw lines.
  // Cubic curves keep the line closer to react-native-graph's smooth look.
  return coordinates.slice(1).reduce((path, point, index) => {
    const previousPoint = coordinates[index];
    const middleX = previousPoint.x + (point.x - previousPoint.x) / 2;

    return `${path} C ${middleX} ${previousPoint.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${coordinates[0].x} ${coordinates[0].y}`);
}

function buildAreaPath(coordinates: ChartCoordinate[], baselineY: number) {
  if (coordinates.length === 0) {
    return "";
  }

  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];
  const curveSegments = coordinates.slice(1).map((point, index) => {
    const previousPoint = coordinates[index];
    const middleX = previousPoint.x + (point.x - previousPoint.x) / 2;

    return `C ${middleX} ${previousPoint.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  });

  // The filled area follows the line, then closes down to the chart baseline.
  return [
    `M ${firstPoint.x} ${baselineY}`,
    `L ${firstPoint.x} ${firstPoint.y}`,
    ...curveSegments,
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
  panGestureDelay = 40,
  points,
  style,
  tapMaxDurationMs = 250,
  tapMoveThreshold = 8,
  verticalPadding = 20,
}: NativeLineChartProps<TPoint>) {
  const [width, setWidth] = useState(0);
  const [activeCoordinate, setActiveCoordinate] = useState<ChartCoordinate | null>(null);
  const gestureStartRef = useRef<{ moved: boolean; startedAt: number; x: number; y: number } | null>(null);
  const isInteractingRef = useRef(false);

  const chart = useMemo(() => {
    // Convert each data value into a canvas coordinate inside the chart bounds.
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
      // Canvas y=0 starts at the top, so higher values need smaller y coordinates.
      const y = verticalPadding + chartHeight - normalizedValue * chartHeight;

      return { x, y };
    });

    return {
      areaPath: buildAreaPath(coordinates, height - verticalPadding),
      chartHeight,
      coordinates,
      linePath: buildLinePath(coordinates),
      minValue,
      valueRange,
    };
  }, [height, horizontalPadding, points, verticalPadding, width]);

  const getSelectionAtX = (x: number): ChartSelection<TPoint> | null => {
    const coordinates = chart.coordinates;

    if (coordinates.length === 0 || points.length === 0) {
      return null;
    }

    if (coordinates.length === 1) {
      return {
        coordinate: coordinates[0],
        point: points[0],
      };
    }

    const clampedX = clamp(x, coordinates[0].x, coordinates[coordinates.length - 1].x);
    const segmentIndex = coordinates.findIndex((coordinate, index) => {
      const nextCoordinate = coordinates[index + 1];
      return Boolean(nextCoordinate) && clampedX >= coordinate.x && clampedX <= nextCoordinate.x;
    });
    const safeSegmentIndex = Math.max(segmentIndex, 0);
    const startCoordinate = coordinates[safeSegmentIndex];
    const endCoordinate = coordinates[safeSegmentIndex + 1];

    if (!endCoordinate) {
      const nearestIndex = findNearestCoordinateIndex(coordinates, clampedX);

      return {
        coordinate: coordinates[nearestIndex],
        point: points[nearestIndex],
      };
    }

    const middleX = startCoordinate.x + (endCoordinate.x - startCoordinate.x) / 2;
    const curveProgress = findCubicProgressForX(startCoordinate.x, middleX, endCoordinate.x, clampedX);
    const y = cubicAt(startCoordinate.y, startCoordinate.y, endCoordinate.y, endCoordinate.y, curveProgress);
    const segmentProgress =
      endCoordinate.x === startCoordinate.x
        ? 0
        : (clampedX - startCoordinate.x) / (endCoordinate.x - startCoordinate.x);
    const startPoint = points[safeSegmentIndex];
    const endPoint = points[safeSegmentIndex + 1];
    const nearestPoint = segmentProgress < 0.5 ? startPoint : endPoint;
    const valueRatio = clamp((verticalPadding + chart.chartHeight - y) / chart.chartHeight, 0, 1);
    const value = chart.minValue + valueRatio * chart.valueRange;
    const date = new Date(
      startPoint.date.getTime() + (endPoint.date.getTime() - startPoint.date.getTime()) * segmentProgress,
    );

    return {
      coordinate: {
        x: clampedX,
        y,
      },
      point: {
        ...nearestPoint,
        date,
        value,
      },
    };
  };

  const selectPointAtX = (x: number) => {
    const selection = getSelectionAtX(x);

    if (!selection) {
      return;
    }

    setActiveCoordinate(selection.coordinate);
    onPointSelected?.(selection.point);
  };

  const endInteraction = () => {
    // Notify the parent once per drag so it can restore scroll or clear interaction state.
    if (isInteractingRef.current) {
      isInteractingRef.current = false;
      onGestureEnd?.();
    }

    setActiveCoordinate(null);
  };

  const startInteraction = (x: number) => {
    if (!isInteractingRef.current) {
      isInteractingRef.current = true;
      onGestureStart?.();
    }

    selectPointAtX(x);
  };

  const handleGestureStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    // Store the first touch so release can decide whether it was a tap or a drag.
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

    // Small finger jitter still counts as a tap; only a real move becomes chart scrubbing.
    if (movedFarEnough) {
      gestureStart.moved = true;
    }

    if (gestureStart.moved && Date.now() - gestureStart.startedAt >= panGestureDelay) {
      startInteraction(event.nativeEvent.locationX);
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

    // Taps and drags intentionally do different things: tap may navigate, drag selects points.
    if (isTap) {
      onPress?.();
    }

    endInteraction();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          // Let vertical page scroll win until the movement clearly belongs to the chart.
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
    [
      chart.coordinates,
      chart.chartHeight,
      chart.minValue,
      chart.valueRange,
      enablePanGesture,
      onGestureEnd,
      onGestureStart,
      onPointSelected,
      onPress,
      panGestureDelay,
      points,
      tapMoveThreshold,
      width,
    ],
  );

  const gradientStart = gradientFillColors?.[0] ?? `${color}55`;
  const gradientEnd = gradientFillColors?.[1] ?? `${color}00`;

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.container, { height }, style]}
      {...panResponder.panHandlers}
    >
      {width > 0 ? (
        <Canvas style={{ height, width }}>
          {chart.areaPath ? (
            <Path path={chart.areaPath}>
              <LinearGradient
                colors={[gradientStart, gradientEnd]}
                end={vec(0, height)}
                start={vec(0, 0)}
              />
            </Path>
          ) : null}
          {chart.linePath ? (
            <Path
              color={color}
              path={chart.linePath}
              strokeCap="round"
              strokeJoin="round"
              strokeWidth={lineThickness}
              style="stroke"
            />
          ) : null}
          {activeCoordinate ? (
            <>
              <Line
                color={color}
                opacity={0.24}
                p1={vec(activeCoordinate.x, verticalPadding)}
                p2={vec(activeCoordinate.x, height - verticalPadding)}
                strokeWidth={1}
              />
              <Circle color={color} cx={activeCoordinate.x} cy={activeCoordinate.y} r={6} />
              <Circle
                color={color}
                cx={activeCoordinate.x}
                cy={activeCoordinate.y}
                r={11}
                strokeWidth={2}
                style="stroke"
              />
            </>
          ) : null}
        </Canvas>
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
