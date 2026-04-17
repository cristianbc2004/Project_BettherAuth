import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/components/auth-input";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { appConfig } from "@/lib/app-config";
import { authClient } from "@/lib/auth-client";
import { buildAuthFetchOptions, useLanguage } from "@/lib/locale";

type AuthMode = "signIn" | "signUp";

type AuthFormProps = {
  mode: AuthMode;
};

type SignInValues = {
  email: string;
  password: string;
};

type SignUpValues = SignInValues & {
  name: string;
};

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
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-2xl font-black text-ink-900">{title}</Text>
      <Text className="mt-2 text-base leading-6 text-ink-600">{description}</Text>
      <View className="mt-6">{children}</View>
      {serverError ? <Text className="mb-2 text-sm text-red-500">{serverError}</Text> : null}
      <Text className="mt-6 text-center text-sm text-ink-600">
        {ctaHref === "/sign-up" ? t("authForm.needAccount") : t("authForm.alreadyHaveAccount")}
        <Link href={ctaHref} className="font-bold text-coral-500">
          {ctaLabel}
        </Link>
      </Text>
    </View>
  );
}

function SignInForm() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { locale } = useLanguage();
  const signInSchema = z.object({
    email: z.email(t("authForm.invalidEmail")),
    password: z.string().min(8, t("authForm.minPassword")),
  });
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

      const response = await authClient.signIn.email({
        ...values,
        callbackURL: appConfig.emailVerificationSuccessUrl,
        ...buildAuthFetchOptions(locale),
      });

      if (response.error) {
        const message = response.error.message ?? t("authForm.genericError");
        setServerError(message);
        Alert.alert(t("authForm.signInFailed"), message);
        return;
      }

      const signInData = response.data as
        | { twoFactorRedirect?: boolean; twoFactorMethods?: string[] }
        | undefined;

      if (signInData?.twoFactorRedirect) {
        router.replace("/two-factor-verify" as never);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authForm.networkError");
      setServerError(message);
      Alert.alert(t("authForm.signInFailed"), message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthFormFrame
      ctaHref="/sign-up"
      ctaLabel={t("authForm.createOne")}
      description={t("authForm.welcomeDescription")}
      serverError={serverError}
      title={t("authForm.welcomeBack")}
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
            label={t("authForm.email")}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t("authForm.emailPlaceholder")}
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
              label={t("authForm.password")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("authForm.passwordPlaceholder")}
              value={value}
            />
          )}
      />

      <Text className="mb-4 mt-1 text-right text-sm text-ink-600">
        <Link href={"/forgot-password" as never} className="font-semibold text-coral-500">
          {t("authForm.forgotPassword")}
        </Link>
      </Text>

      <AuthSubmitButton
        isPending={isPending}
        label={t("authForm.signIn")}
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthFormFrame>
  );
}

function SignUpForm() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { locale } = useLanguage();
  const signUpSchema = z
    .object({
      name: z.string().min(2, t("authForm.minName")),
      email: z.email(t("authForm.invalidEmail")),
      password: z.string().min(8, t("authForm.minPassword")),
    });
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

      if (
        appConfig.resendTestRecipient &&
        values.email.trim().toLowerCase() !== appConfig.resendTestRecipient
      ) {
        const message = `Resend test mode only sends emails to ${appConfig.resendTestRecipient}. Verify your own domain in Resend to send verification emails to other users.`;
        setServerError(message);
        Alert.alert(t("authForm.signUpFailed"), message);
        return;
      }

      const response = await authClient.signUp.email({
        ...values,
        callbackURL: appConfig.emailVerificationSuccessUrl,
        ...buildAuthFetchOptions(locale),
      });

      if (response.error) {
        const message = response.error.message ?? t("authForm.genericError");
        setServerError(message);
        Alert.alert(t("authForm.signUpFailed"), message);
        return;
      }

      Alert.alert(
        t("authForm.createAccount"),
        "We created your account. Check your email and verify it before signing in.",
      );
      router.replace("/sign-in");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("authForm.networkError");
      setServerError(message);
      Alert.alert(t("authForm.signUpFailed"), message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <AuthFormFrame
      ctaHref="/sign-in"
      ctaLabel={t("authForm.signIn")}
      description={t("authForm.createAccountDescription")}
      serverError={serverError}
      title={t("authForm.createAccount")}
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AuthInput
            autoCapitalize="words"
            autoCorrect={false}
            error={error?.message}
            label={t("authForm.fullName")}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t("authForm.namePlaceholder")}
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
            label={t("authForm.email")}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t("authForm.emailPlaceholder")}
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
              label={t("authForm.password")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("authForm.passwordPlaceholder")}
              value={value}
            />
          )}
      />

      <AuthSubmitButton
        isPending={isPending}
        label={t("authForm.createAccountButton")}
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
