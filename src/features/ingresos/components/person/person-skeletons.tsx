import { ScrollView, View } from "react-native";

import { SkeletonBlock, SkeletonText } from "@/shared/components/ui/skeleton";
import { useAppTheme } from "@/shared/lib/theme-context";

function PersonSkeletonFrame({ children }: { children: React.ReactNode }) {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-32 pt-20"
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
    >
      {children}
    </ScrollView>
  );
}

function PersonHeaderSkeleton() {
  return (
    <View>
      <SkeletonBlock height={48} radius={18} width={48} />
      <View className="mt-3">
        <SkeletonText height={34} width="58%" />
      </View>
    </View>
  );
}

export function PersonGeneralSkeleton() {
  return (
    <PersonSkeletonFrame>
      <PersonHeaderSkeleton />

      <View className="mt-8">
        <SkeletonText height={28} width="56%" />
        <View className="mt-2">
          <SkeletonText height={16} width="34%" />
        </View>
      </View>

      <View className="mt-10">
        <SkeletonText height={13} width="32%" />
        <View className="mt-2">
          <SkeletonText height={36} width="48%" />
        </View>
        <View className="mt-2">
          <SkeletonText height={15} width="26%" />
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
        <SkeletonText height={20} width="38%" />
        <View className="mt-2">
          <SkeletonText height={16} width="52%" />
        </View>
      </View>

      <View className="mt-8">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <SkeletonText height={20} width="54%" />
            <View className="mt-1">
              <SkeletonText height={15} width="36%" />
            </View>
          </View>
          <SkeletonBlock height={33} radius={14} width={46} />
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <SkeletonText height={13} width="42%" />
            <View className="mt-1">
              <SkeletonText height={22} width="62%" />
            </View>
          </View>
          <View className="flex-1">
            <SkeletonText height={13} width="46%" />
            <View className="mt-1">
              <SkeletonText height={22} width="58%" />
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row gap-8">
          <View className="flex-1">
            <SkeletonText height={13} width="34%" />
            <View className="mt-1">
              <SkeletonText height={20} width="22%" />
            </View>
          </View>
          <View className="flex-1">
            <SkeletonText height={13} width="44%" />
            <View className="mt-1">
              <SkeletonText height={20} width="26%" />
            </View>
          </View>
        </View>

        <View className="mt-5">
          <SkeletonBlock height={1} radius="square" width="100%" />
        </View>
      <View className="mt-4 gap-2">
          <SkeletonText height={15} width="96%" />
          <SkeletonText height={15} width="88%" />
          <SkeletonText height={15} width="68%" />
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
        <SkeletonText height={13} width="28%" />
        <View className="mt-2">
          <SkeletonText height={28} width="44%" />
        </View>
        <View className="mt-1">
          <SkeletonText height={16} width="36%" />
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between gap-4 px-1">
        <View className="flex-1">
          <SkeletonText height={11} width="34%" />
          <View className="mt-1">
            <SkeletonText height={16} width="56%" />
          </View>
          <View className="mt-1">
            <SkeletonText height={12} width="24%" />
          </View>
        </View>

        <View className="flex-1 items-end">
          <SkeletonText height={11} width="34%" />
          <View className="mt-1">
            <SkeletonText height={16} width="56%" />
          </View>
          <View className="mt-1">
            <SkeletonText height={12} width="24%" />
          </View>
        </View>
      </View>

      <View className="mt-5 flex-row">
        <SkeletonBlock height={44} radius={999} width={82} />
        <View className="ml-3">
          <SkeletonBlock height={44} radius={999} width={116} />
        </View>
        <View className="ml-3">
          <SkeletonBlock height={44} radius={999} width={128} />
        </View>
      </View>

      <View className="mt-6">
        <SkeletonBlock height={280} radius={18} width="100%" />
      </View>

      <View className="mt-5 flex-row">
        <SkeletonBlock height={44} radius={999} width={104} />
        <View className="ml-3">
          <SkeletonBlock height={44} radius={999} width={138} />
        </View>
      </View>
    </PersonSkeletonFrame>
  );
}
