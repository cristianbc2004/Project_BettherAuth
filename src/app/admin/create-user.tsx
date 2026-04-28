import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AdminMinimalPanel, AdminMinimalSection } from "@/shared/components/ui/admin/admin-minimal-panel";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { StatusMessage } from "@/shared/components/ui/status-message";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

export default function CreateUserScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isPasswordRequirementsFocused, setIsPasswordRequirementsFocused] = useState(false);
  const [passwordRequirementsScrollRequest, setPasswordRequirementsScrollRequest] = useState(0);
  const createUserSchema = z.object({
    email: z.email(t("authForm.invalidEmail")),
    name: z.string().min(2, t("authForm.minName")),
    password: z
      .string()
      .min(8, t("authForm.minPassword"))
      .regex(/[A-Z]/, t("authForm.passwordNeedsUppercase"))
      .regex(/[a-z]/, t("authForm.passwordNeedsLowercase"))
      .regex(/\d/, t("authForm.passwordNeedsNumber")),
  });
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const passwordValue = form.watch("password");
  const requestPasswordRequirementsScroll = () => {
    setIsPasswordRequirementsFocused(true);
    setPasswordRequirementsScrollRequest((currentValue) => currentValue + 1);
  };

  const sessionRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const isAdmin = sessionRole
    .split(",")
    .map((entry) => entry.trim())
    .includes("admin");

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  if (!isAdmin) {
    return <Redirect href="/dashboard" />;
  }

  const handleCreateUser = form.handleSubmit(async (values) => {
    setIsCreatingUser(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result = await authClient.admin.createUser({
        email: values.email,
        password: values.password,
        name: values.name,
        role,
        ...buildAuthFetchOptions(locale),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? t("admin.createError"));
        return;
      }

      form.reset();
      setRole("user");
      setMessage(t("admin.createSuccess"));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("authForm.networkError"));
    } finally {
      setIsCreatingUser(false);
    }
  });

  return (
    <AuthShell
      backHref="/admin"
      eyebrow=""
      keyboardFocusScrollY={isPasswordRequirementsFocused ? 260 : undefined}
      scrollRequestKey={isPasswordRequirementsFocused ? passwordRequirementsScrollRequest : undefined}
      subtitle={`Manage admin actions for ${session.user.email} with the same minimal secure flow.`}
      title={t("admin.createPageTitle")}
    >
      {message ? <StatusMessage message={message} tone="success" /> : null}
      {errorMessage ? <StatusMessage message={errorMessage} tone="error" /> : null}

      <AdminMinimalPanel>
        <AdminMinimalSection title={t("admin.formTitle")}>
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
                onFocus={() => {
                  setIsPasswordRequirementsFocused(false);
                }}
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
                onFocus={() => {
                  setIsPasswordRequirementsFocused(false);
                }}
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
                onFocus={requestPasswordRequirementsScroll}
                placeholder={t("authForm.passwordPlaceholder")}
                value={value}
              />
            )}
          />
          <PasswordRequirements password={passwordValue} />
        </AdminMinimalSection>

        <AdminMinimalSection title={t("admin.role")}>
          <View className="flex-row rounded-[24px] border border-white/6 bg-white/[0.04] p-1">
            {(["user", "admin"] as const).map((option) => {
              const isSelected = role === option;

              return (
                <Pressable
                  className={`flex-1 items-center rounded-[20px] py-3 ${
                    isSelected ? "bg-[#8d3dff]" : "bg-transparent"
                  }`}
                  key={option}
                  onPress={() => {
                    setRole(option);
                  }}
                >
                  <Text
                    className={`text-sm font-semibold uppercase tracking-[1.1px] ${
                      isSelected ? "text-white" : "text-white/50"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </AdminMinimalSection>

        <AdminMinimalSection title={t("admin.createTitle")} description={t("admin.createDescription")}>
          <AuthSubmitButton
            isPending={isCreatingUser}
            label={t("admin.createUser")}
            onPress={() => {
              void handleCreateUser();
            }}
          />
        </AdminMinimalSection>
      </AdminMinimalPanel>
    </AuthShell>
  );
}
