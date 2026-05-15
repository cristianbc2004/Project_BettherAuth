import { memo } from "react";
import { type DimensionValue } from "react-native";
import { Skeleton } from "moti/skeleton";

import { useAppTheme } from "@/shared/lib/theme-context";

type SkeletonBlockProps = {
  height: DimensionValue;
  radius?: number | "round" | "square";
  width?: DimensionValue;
};

function SkeletonBlockComponent({ height, radius = 8, width = "100%" }: SkeletonBlockProps) {
  const { resolvedThemeName } = useAppTheme();

  return (
    <Skeleton
      colorMode={resolvedThemeName}
      height={height}
      radius={radius}
      show={true}
      width={width}
    />
  );
}

export const SkeletonBlock = memo(SkeletonBlockComponent);

type SkeletonTextProps = {
  height: number;
  width?: DimensionValue;
};

function SkeletonTextComponent({ height, width = "100%" }: SkeletonTextProps) {
  return <SkeletonBlock height={height} radius={6} width={width} />;
}

export const SkeletonText = memo(SkeletonTextComponent);

type SkeletonCircleProps = {
  size?: number;
};

function SkeletonCircleComponent({ size = 48 }: SkeletonCircleProps) {
  return <SkeletonBlock height={size} radius="round" width={size} />;
}

export const SkeletonCircle = memo(SkeletonCircleComponent);
