import { Redirect, router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";

export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <View className="flex-1 px-6 pb-10 pt-8">
        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          Authenticated dashboard
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">
          Hello, {session.user.name.split(" ")[0]}.
        </Text>
        <Text className="mt-4 max-w-[320px] text-base leading-6 text-ink-100">
          Your Expo Router screens, Better Auth API route, and Prisma-backed Neon database are ready to
          connect.
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow="Profile" title={session.user.email}>
            <Text className="text-base leading-6 text-ink-100">
              Signed in as {session.user.name}. This session is stored securely through the Expo Better
              Auth client plugin.
            </Text>
          </DashboardCard>

          <DashboardCard eyebrow="Backend" title="Prisma + Neon">
            <Text className="text-base leading-6 text-ink-100">
              Run a Prisma migration after you add your Neon connection string, then the same auth flow
              will persist users, sessions, accounts, and verification records.
            </Text>
          </DashboardCard>
        </View>

        <View className="mt-auto">
          <AuthSubmitButton
            isPending={false}
            label="Sign out"
            onPress={() => {
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.replace("/sign-in");
                  },
                },
              });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
