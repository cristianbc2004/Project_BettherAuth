import { ScrollView, View } from "react-native";

import { SkeletonBlock, SkeletonCircle, SkeletonText } from "@/shared/components/ui/skeleton";
import { useAppTheme } from "@/shared/lib/theme-context";

function PersonSkeletonFrame({ children }: { children: React.ReactNode }) {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-10 pt-20"
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
    >
      {children}
    </ScrollView>
  );
}

function PersonHeaderSkeleton() {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-4">
        <SkeletonText height={34} width="72%" />
      </View>
      <SkeletonBlock height={48} radius={18} width={48} />
    </View>
  );
}

export function PersonGeneralSkeleton() {
  return (
    <PersonSkeletonFrame>
      <PersonHeaderSkeleton />

      <View className="mt-8">
        <SkeletonText height={34} width="64%" />
        <View className="mt-3">
          <SkeletonText height={16} width="42%" />
        </View>
      </View>

      <View className="mt-10">
        <SkeletonText height={13} width="48%" />
        <View className="mt-3">
          <SkeletonText height={40} width="70%" />
        </View>
        <View className="mt-3">
          <SkeletonText height={15} width="36%" />
        </View>
      </View>
    </PersonSkeletonFrame>
  );
}

export function PersonDetailsSkeleton() {
  return (
    <PersonSkeletonFrame>
      <PersonHeaderSkeleton />

      <View className="mt-6">
        <SkeletonText height={22} width="58%" />
        <View className="mt-3">
          <SkeletonText height={16} width="76%" />
        </View>
      </View>

      <View className="mt-8">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <SkeletonText height={22} width="74%" />
            <View className="mt-2">
              <SkeletonText height={15} width="46%" />
            </View>
          </View>
          <SkeletonBlock height={34} radius={14} width={54} />
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <SkeletonText height={13} width="60%" />
            <View className="mt-2">
              <SkeletonText height={24} width="78%" />
            </View>
          </View>
          <View className="flex-1">
            <SkeletonText height={13} width="58%" />
            <View className="mt-2">
              <SkeletonText height={24} width="72%" />
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row gap-8">
          <View className="flex-1">
            <SkeletonText height={13} width="54%" />
            <View className="mt-2">
              <SkeletonText height={22} width="38%" />
            </View>
          </View>
          <View className="flex-1">
            <SkeletonText height={13} width="64%" />
            <View className="mt-2">
              <SkeletonText height={22} width="42%" />
            </View>
          </View>
        </View>

        <View className="mt-5">
          <SkeletonBlock height={1} radius="square" width="100%" />
        </View>
        <View className="mt-4 gap-2">
          <SkeletonText height={15} width="92%" />
          <SkeletonText height={15} width="84%" />
          <SkeletonText height={15} width="58%" />
        </View>
      </View>
    </PersonSkeletonFrame>
  );
}

export function PersonGraphicSkeleton() {
  return (
    <PersonSkeletonFrame>
      <PersonHeaderSkeleton />

      <View className="mt-6">
        <SkeletonText height={13} width="42%" />
        <View className="mt-3">
          <SkeletonText height={32} width="64%" />
        </View>
        <View className="mt-3">
          <SkeletonText height={16} width="48%" />
        </View>
      </View>

      <View className="mt-5 flex-row">
        <SkeletonBlock height={44} radius={22} width={82} />
        <View className="ml-3">
          <SkeletonBlock height={44} radius={22} width={142} />
        </View>
        <View className="ml-3">
          <SkeletonCircle size={44} />
        </View>
      </View>

      <View className="mt-6">
        <SkeletonText height={13} width="54%" />
        <View className="mt-3">
          <SkeletonBlock height={220} radius={18} width="100%" />
        </View>
        <View className="mt-3">
          <SkeletonText height={13} width="62%" />
        </View>
      </View>
    </PersonSkeletonFrame>
  );
}
