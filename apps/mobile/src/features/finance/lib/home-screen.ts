import { weeklyBalance } from "@/features/finance/mocks";
import type { NativeLineChartPoint } from "@/shared/components/ui/native-line-chart";

export type HomeBalancePoint = NativeLineChartPoint & {
  label: string;
};

export function getHomeChartWidth(width: number) {
  return Math.max(width - 40, 300);
}

export function getHomeGraphColor(resolvedThemeName: "light" | "dark") {
  return resolvedThemeName === "dark" ? "#78a9ff" : "#3467d6";
}

export function getHomeScreenBackgroundColor(
  resolvedThemeName: "light" | "dark",
  backgroundElevated: string,
  background: string,
) {
  return resolvedThemeName === "light" ? backgroundElevated : background;
}

export function getHomeFirstName(name?: string | null) {
  if (!name) {
    return "Cristian";
  }

  const firstName = name.split(" ")[0];
  return firstName || name;
}

export function buildHomeBalancePoints() {
  return weeklyBalance.map((point, index) => ({
    date: new Date(`2026-04-${(22 + index).toString().padStart(2, "0")}T00:00:00`),
    label: point.label,
    value: point.value,
  })) satisfies HomeBalancePoint[];
}

export function getCurrentBalancePoint(
  selectedPoint: HomeBalancePoint | null,
  balancePoints: HomeBalancePoint[],
) {
  return selectedPoint ?? balancePoints[balancePoints.length - 1];
}
