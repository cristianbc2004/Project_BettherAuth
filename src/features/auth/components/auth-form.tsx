import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { appConfig } from "@/shared/lib/app-config";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";

type AuthMode = "signIn" | "signUp";

type AuthFormProps = {
  mode: AuthMode;
};

function AuthFormFrame({
  children,
  ctaHref,
  ctaLabel,
  serverError,
}: {
  children: ReactNode;
  ctaHref: "/sign-in" | "/sign-up";
  ctaLabel: string;
  serverError: string | null;
}) {
  const { t } = useTranslation();

  return (
    <View className="px-4 pb-6 pt-6">
      <View>{children}</View>
      {serverError ? (
        <View className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <Text className="text-sm text-red-300">{serverError}</Text>
        </View>
      ) : null}
      <View className="mt-8">
        <Text className="text-center text-sm text-white/75">
          {ctaHref === "/sign-up" ? t("authForm.needAccount") : t("authForm.alreadyHaveAccount")}
          <Link href={ctaHref} className="font-bold text-[#9851ff]">
            {ctaLabel}
          </Link>
        </Text>
      </View>
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
  const form = useForm<z.infer<typeof signInSchema>>({
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
      serverError={serverError}
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

      <View className="mb-2 mt-1 flex-row items-center justify-end">
        <Link href={"/forgot-password" as never} className="font-medium text-[#a8b0c7]">
          {t("authForm.forgotPassword")}
        </Link>
      </View>

      <AuthSubmitButton
        isPending={isPending}
        label="Get Started"
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
      password: z
        .string()
        .min(8, t("authForm.minPassword"))
        .regex(/[A-Z]/, t("authForm.passwordNeedsUppercase"))
        .regex(/[a-z]/, t("authForm.passwordNeedsLowercase"))
        .regex(/\d/, t("authForm.passwordNeedsNumber")),
    });
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const passwordValue = form.watch("password");

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
      serverError={serverError}
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
      <PasswordRequirements password={passwordValue} />

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
