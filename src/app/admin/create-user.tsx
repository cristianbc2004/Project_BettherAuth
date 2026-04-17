import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/components/auth-input";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";

export default function CreateUserScreen() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    setMessage(null);
    setErrorMessage(null);

    const result = await authClient.admin.createUser({
      email,
      password,
      name,
      role,
    });

    setIsCreatingUser(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? "Could not create the user.");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setMessage("User created successfully.");
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable className="mb-6 self-start" onPress={() => router.back()}>
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">Back</Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          Admin create
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">Create a user.</Text>
        <Text className="mt-4 max-w-[340px] text-base leading-6 text-ink-100">
          Add a new account and choose whether it should be a regular user or an admin.
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard eyebrow="Form" title="New user details">
            <AuthInput
              autoCapitalize="words"
              autoCorrect={false}
              label="Name"
              onChangeText={setName}
              placeholder="James Smith"
              value={name}
            />
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="user@example.com"
              value={email}
            />
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label="Password"
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
            />
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label="Role"
              onChangeText={(value) => {
                setRole(value?.trim().toLowerCase() === "admin" ? "admin" : "user");
              }}
              placeholder="user or admin"
              value={role}
            />

            <AuthSubmitButton
              isPending={isCreatingUser}
              label="Create user"
              onPress={() => {
                void handleCreateUser();
              }}
            />
          </DashboardCard>

          {message ? (
            <View className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <Text className="text-base leading-6 text-emerald-100">{message}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
              <Text className="text-base leading-6 text-red-100">{errorMessage}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
