import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthPasswordInput } from "@/components/auth-password-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { appConfig } from "@/lib/app-config";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (!email) {
        const message = "Missing email. Go back and enter the account email first.";
        setServerError(message);
        Alert.alert("Reset failed", message);
        return;
      }

      setServerError(null);
      setIsPending(true);

      const response = await fetch(`${appConfig.authApiUrl}/api/password/reset-direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword: values.newPassword,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        const message = data.error ?? "Could not reset your password.";
        setServerError(message);
        Alert.alert("Reset failed", message);
        return;
      }

      Alert.alert("Password updated", "Your password has been reset successfully.");
      router.replace("/sign-in");
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
      eyebrow="Choose a new password"
      subtitle={`Set a fresh password for ${email || "the selected account"}.`}
      title="Reset password."
    >
      <Text className="text-2xl font-black text-ink-900">Create a new password</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">
        Use at least 8 characters and make it different from your previous password.
      </Text>

      <View className="mt-6">
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label="New password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="At least 8 characters"
              value={value}
            />
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label="Confirm new password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Repeat the new password"
              value={value}
            />
          )}
        />
      </View>

      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}

      <AuthSubmitButton
        isPending={isPending}
        label="Update password"
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthShell>
  );
}
