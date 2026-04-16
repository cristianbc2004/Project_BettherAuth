import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/components/auth-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { appConfig } from "@/lib/app-config";
const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const checkEmailUrl = new URL("/api/password/check-email", appConfig.authApiUrl);
      checkEmailUrl.searchParams.set("email", values.email);

      const response = await fetch(checkEmailUrl.toString());

      const data = (await response.json()) as { exists?: boolean; error?: string };

      if (!response.ok) {
        const message = data.error ?? "Could not check the email.";
        setServerError(message);
        Alert.alert("Reset failed", message);
        return;
      }

      if (!data.exists) {
        const message = "That email does not exist in the database.";
        setServerError(message);
        Alert.alert("Email not found", message);
        return;
      }

      router.push({
        pathname: "/reset-password" as never,
        params: {
          email: values.email,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setServerError(message);
      Alert.alert("Reset failed", message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthShell
      eyebrow="Password reset"
      subtitle="Enter your email. If it exists in the database, we will take you to the password change screen."
      title="Forgot your password?"
    >
      <Text className="text-2xl font-black text-ink-900">Recover access</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">
        For this lab flow, we first confirm the email exists and then let you choose a new password.
      </Text>

      <View className="mt-6">
        <Controller
          control={form.control}
          name="email"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              error={error?.message}
              keyboardType="email-address"
              label="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="you@example.com"
              value={value}
            />
          )}
        />
      </View>

      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label="Continue"
        onPress={() => {
          void handleSubmit();
        }}
      />

      <Text className="mt-6 text-center text-sm text-ink-600">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-bold text-coral-500">
          Sign in
        </Link>
      </Text>
    </AuthShell>
  );
}
