import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/components/auth-input";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { authClient } from "@/lib/auth-client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const response = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (response.error) {
        const message = response.error.message ?? "Could not update your password.";
        setServerError(message);
        Alert.alert("Update failed", message);
        return;
      }

      Alert.alert("Password updated", "Your password has been changed successfully.");
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setServerError(message);
      Alert.alert("Update failed", message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthShell
      eyebrow="Account security"
      subtitle="Update your password using your current one, as described in the Better Auth email/password guide."
      title="Change password."
    >
      <Text className="text-2xl font-black text-ink-900">Keep your account secure</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">
        Enter your current password, then choose a new one. Other sessions will be revoked.
      </Text>

      <View className="mt-6">
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthPasswordInput
              error={error?.message}
              label="Current password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Your current password"
              value={value}
            />
          )}
        />

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
              placeholder="Repeat your new password"
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
