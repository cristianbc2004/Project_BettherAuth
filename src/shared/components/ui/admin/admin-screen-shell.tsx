import { router } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  subtitle: string;
  title: string;
  trailingAction?: ReactNode;
}>;

export function AdminScreenShell({
  children,
  eyebrow,
  subtitle,
  title,
  trailingAction,
}: AdminScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#060c17]">
      <View className="absolute inset-0">
        <View className="absolute inset-0 bg-[#060c17]" />
        <View className="absolute inset-x-0 top-0 h-[310px] bg-[#3a1b78]/18" />
        <View className="absolute right-[-42] top-[-28] h-72 w-72 rounded-full bg-[#6d34d8]/14" />
        <View className="absolute left-[-72] top-[190px] h-44 w-44 rounded-full bg-[#ff9e6d]/8" />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
            onPress={() => {
              router.back();
            }}
          >
            <Text className="text-xl font-light text-white/80">{"<"}</Text>
          </Pressable>

          <Text className="text-[24px] font-semibold text-white">Admin</Text>

          {trailingAction ?? <View className="h-11 w-11" />}
        </View>

        <View className="rounded-[34px] border border-white/10 bg-white/[0.06] p-5">
          <Text className="mb-4 text-[11px] font-semibold uppercase tracking-[1.6px] text-white/70">
            {eyebrow}
          </Text>
          <Text className="text-[42px] font-semibold leading-[48px] text-white">{title}</Text>
          <Text className="mt-4 max-w-[360px] text-[15px] leading-6 text-white/60">{subtitle}</Text>
        </View>

        <View className="mt-6 gap-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
