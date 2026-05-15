import { View } from "react-native";

import { SkeletonBlock, SkeletonCircle, SkeletonText } from "@/shared/components/ui/skeleton";
import { useAppTheme } from "@/shared/lib/theme-context";

export function BizumOverviewSkeleton() {
  const { theme } = useAppTheme();

  return (
    <>
      <View
        className="overflow-hidden rounded-[28px] border p-5"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderCurve: "continuous",
          boxShadow: "0 18px 40px rgba(7, 17, 31, 0.08)",
        }}
      >
        <View className="flex-row items-center">
          <SkeletonBlock height={48} radius={18} width={48} />
          <View className="ml-4 flex-1">
            <SkeletonText height={24} width="76%" />
            <View className="mt-2">
              <SkeletonText height={14} width="48%" />
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1 items-center justify-center py-2">
            <SkeletonCircle size={64} />
            <View className="mt-3">
              <SkeletonText height={18} width={64} />
            </View>
          </View>

          <View className="flex-1 items-center justify-center py-2">
            <SkeletonCircle size={64} />
            <View className="mt-3">
              <SkeletonText height={18} width={52} />
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between px-1">
          <SkeletonText height={22} width="48%" />
          <SkeletonText height={18} width={58} />
        </View>

        <View>
          {Array.from({ length: 3 }, (_, index) => (
            <View key={index}>
              <View className="flex-row items-center rounded-[24px] px-3 py-4">
                <SkeletonCircle size={48} />
                <View className="ml-4 flex-1 pr-3">
                  <SkeletonText height={18} width="62%" />
                  <View className="mt-2">
                    <SkeletonText height={14} width="36%" />
                  </View>
                </View>
                <SkeletonText height={18} width={74} />
              </View>
              {index < 2 ? <View className="ml-16 h-px" style={{ backgroundColor: theme.border }} /> : null}
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

export function BizumActionSkeleton() {
  const { theme } = useAppTheme();

  return (
    <View className="pt-2">
      <View className="mb-6">
        <SkeletonText height={28} width="64%" />
        <View className="mt-2">
          <SkeletonText height={16} width="82%" />
        </View>
      </View>

      <View className="gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <View
            className="flex-row items-center rounded-[24px] border px-4 py-4"
            key={index}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <SkeletonCircle size={48} />
            <View className="ml-4 flex-1">
              <SkeletonText height={18} width={index % 2 === 0 ? "58%" : "72%"} />
              <View className="mt-2">
                <SkeletonText height={14} width={index % 2 === 0 ? "42%" : "35%"} />
              </View>
            </View>
            <SkeletonBlock height={22} radius="round" width={22} />
          </View>
        ))}
      </View>
    </View>
  );
}
