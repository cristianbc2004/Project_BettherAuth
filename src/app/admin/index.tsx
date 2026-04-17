import { Redirect, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";

export default function AdminPanelScreen() {
  const { data: session, isPending } = authClient.useSession();
  const sessionRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = sessionRole
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!isAdmin) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          className="mb-6 self-start"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">Back</Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          Admin panel
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">Manage users.</Text>
        <Text className="mt-4 max-w-[340px] text-base leading-6 text-ink-100">
          Choose one admin action. Each task now lives in its own screen so the panel stays easier to
          navigate and maintain.
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow="Create" title="Create a new user">
            <Text className="text-base leading-6 text-ink-100">
              Open the create-user screen to register a new account and assign the user or admin role.
            </Text>
            <AuthSubmitButton
              isPending={false}
              label="Open create user"
              onPress={() => {
                router.push("/admin/create-user" as never);
              }}
            />
          </DashboardCard>

          <DashboardCard eyebrow="Directory" title="List users">
            <Text className="text-base leading-6 text-ink-100">
              Review all users, roles, and account status in the dedicated list screen.
            </Text>
            <AuthSubmitButton
              isPending={false}
              label="Open user list"
              onPress={() => {
                router.push("/admin/list-users" as never);
              }}
            />
          </DashboardCard>

          <DashboardCard eyebrow="Delete" title="Delete users">
            <Text className="text-base leading-6 text-ink-100">
              Open the delete-user screen to search for a user and remove the account safely.
            </Text>
            <AuthSubmitButton
              isPending={false}
              label="Open delete user"
              onPress={() => {
                router.push("/admin/delete-user" as never);
              }}
            />
          </DashboardCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
