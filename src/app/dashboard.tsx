import { Redirect, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";


export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = role
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        showsVerticalScrollIndicator={false}
      >
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
            <Text className="mt-3 text-sm font-semibold uppercase tracking-[2px] text-coral-300">
              Role: {role}
            </Text>
          </DashboardCard>

          <DashboardCard eyebrow="Backend" title="Prisma + Neon">
            <Text className="text-base leading-6 text-ink-100">
              Run a Prisma migration after you add your Neon connection string, then the same auth flow
              will persist users, sessions, accounts, and verification records.
            </Text>
          </DashboardCard>

          <DashboardCard eyebrow="Security" title="Change your password">
            <Text className="text-base leading-6 text-ink-100">
              Update your password from the authenticated session using Better Auth&apos;s
              change-password flow.
            </Text>
            <View className="mt-4">
              <AuthSubmitButton
                isPending={false}
                label="Open password settings"
                onPress={() => {
                  router.push("/change-password" as never);
                }}
              />
            </View>
          </DashboardCard>

          <DashboardCard eyebrow="Security" title="Two-factor authentication">
            <Text className="text-base leading-6 text-ink-100">
              Manage your authenticator app setup, verify codes, and disable 2FA if you need to.
            </Text>
            <View className="mt-4">
              <AuthSubmitButton
                isPending={false}
                label="Open 2FA settings"
                onPress={() => {
                  router.push("/two-factor" as never);
                }}
              />
            </View>
          </DashboardCard>

          {isAdmin ? (
            <DashboardCard eyebrow="Admin" title="User management">
              <Text className="text-base leading-6 text-ink-100">
                Open the admin panel to create users, remove users, and review the current user list.
              </Text>
              <View className="mt-4">
                <AuthSubmitButton
                  isPending={false}
                  label="Open admin panel"
                  onPress={() => {
                    router.push("/admin" as never);
                  }}
                />
              </View>
            </DashboardCard>
          ) : null}
        </View>

        <View className="mt-8">
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
      </ScrollView>
    </SafeAreaView>
  );
}
