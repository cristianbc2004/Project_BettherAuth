import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { type ReactNode, useState } from "react";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/components/auth-input";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

type AuthMode = "signIn" | "signUp";

type AuthFormProps = {
  mode: AuthMode;
};

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

function AuthFormFrame({
  children,
  ctaHref,
  ctaLabel,
  description,
  serverError,
  title,
}: {
  children: ReactNode;
  ctaHref: "/sign-in" | "/sign-up";
  ctaLabel: string;
  description: string;
  serverError: string | null;
  title: string;
}) {
  return (
    <View>
      <Text className="text-2xl font-black text-ink-900">{title}</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">{description}</Text>
      <View className="mt-6">{children}</View>
      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}
      <Text className="mt-6 text-center text-sm text-ink-600">
        {ctaHref === "/sign-up" ? "Need an account? " : "Already have an account? "}
        <Link href={ctaHref} className="font-bold text-coral-500">
          {ctaLabel}
        </Link>
      </Text>
    </View>
  );
}

function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const response = await authClient.signIn.email(values);

      if (response.error) {
        const message = response.error.message ?? "Something went wrong. Please try again.";
        setServerError(message);
        Alert.alert("Sign in failed", message);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setServerError(message);
      Alert.alert("Sign in failed", message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthFormFrame
      ctaHref="/sign-up"
      ctaLabel="Create one"
      description="Sign in with your email and password to continue into the dashboard."
      serverError={serverError}
      title="Welcome back"
    >
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

      <Controller
        control={form.control}
        name="password"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AuthPasswordInput
            error={error?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="At least 8 characters"
            value={value}
          />
        )}
      />

      <Text className="mb-4 mt-1 text-right text-sm text-ink-600">
        <Link href={"/forgot-password" as never} className="font-semibold text-coral-500">
          Forgot password?
        </Link>
      </Text>

      <AuthSubmitButton
        isPending={isPending}
        label="Sign in"
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthFormFrame>
  );
}

function SignUpForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      setIsPending(true);

      const response = await authClient.signUp.email(values);

      if (response.error) {
        const message = response.error.message ?? "Something went wrong. Please try again.";
        setServerError(message);
        Alert.alert("Sign up failed", message);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      setServerError(message);
      Alert.alert("Sign up failed", message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthFormFrame
      ctaHref="/sign-in"
      ctaLabel="Sign in"
      description="Create a Better Auth account backed by Prisma and Neon Postgres."
      serverError={serverError}
      title="Create your account"
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AuthInput
            autoCapitalize="words"
            autoCorrect={false}
            error={error?.message}
            label="Full name"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Cristian Vega"
            value={value}
          />
        )}
      />

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

      <Controller
        control={form.control}
        name="password"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AuthPasswordInput
            error={error?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="At least 8 characters"
            value={value}
          />
        )}
      />

      <AuthSubmitButton
        isPending={isPending}
        label="Create account"
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthFormFrame>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  return mode === "signIn" ? <SignInForm /> : <SignUpForm />;
}
