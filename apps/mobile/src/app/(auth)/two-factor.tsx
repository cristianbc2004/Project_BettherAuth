import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useTwoFactorSettings } from "@/features/auth/lib/use-two-factor-settings";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useLanguage } from "@/shared/lib/locale";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

function MinimalSection({
  children,
  title,
}: {
  children?: React.ReactNode;
  description?: string;
  title: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View className="border-t px-4 py-5" style={{ borderColor: theme.border }}>
      <AppText className="text-base font-semibold" style={{ color: theme.text }}>{title}</AppText>
      {children ? <View className="mt-5">{children}</View> : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View className="mb-3 rounded-[20px] border px-4 py-4" style={{ backgroundColor: theme.inputBackground, borderColor: theme.border }}>
      <AppText className="text-xs font-medium uppercase tracking-[1.2px]" style={{ color: theme.mutedText }}>{label}</AppText>
      <AppText className="mt-2 text-[15px]" style={{ color: theme.text }}>{value || "-"}</AppText>
    </View>
  );
}

export default function TwoFactorScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const {
    disableTwoFactor,
    enableTwoFactor,
    errorMessage,
    isDisabling,
    isEnabling,
    isVerifying,
    message,
    password,
    setPassword,
    setVerificationCode,
    setup,
    setupDetails,
    verificationCode,
    verifyTwoFactorSetup,
  } = useTwoFactorSettings(t, locale);

  const twoFactorEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled,
  );

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <AuthShell
      backHref="/dashboard"
      eyebrow=""
      subtitle={`Manage two-factor authentication for ${session.user.email} with the same minimal secure flow.`}
      title="Two-Factor Authentication."
    >
      <View>
        <MinimalSection
          description={
            twoFactorEnabled
              ? t("twoFactor.statusEnabledDescription")
              : t("twoFactor.statusDisabledDescription")
          }
          title={twoFactorEnabled ? t("twoFactor.statusEnabled") : t("twoFactor.statusDisabled")}
        />

        <MinimalSection
          description={twoFactorEnabled ? undefined : t("twoFactor.statusDisabledDescription")}
          title={t("twoFactor.setupTitle")}
        >
          <AuthPasswordInput
            label={t("twoFactor.currentPassword")}
            onChangeText={setPassword}
            placeholder={t("twoFactor.currentPasswordPlaceholder")}
            value={password}
          />

          <AuthSubmitButton
            isPending={twoFactorEnabled ? isDisabling : isEnabling}
            label={twoFactorEnabled ? t("twoFactor.disable2fa") : t("twoFactor.startSetup")}
            onPress={() => {
              if (twoFactorEnabled) {
                void disableTwoFactor();
                return;
              }

              void enableTwoFactor();
            }}
          />
        </MinimalSection>

        {setup ? (
          <MinimalSection description={t("twoFactor.step1Description")} title={t("twoFactor.step1Title")}>
            <InfoRow label={t("twoFactor.issuer")} value={setupDetails?.issuer || "-"} />
            <InfoRow label={t("twoFactor.account")} value={setupDetails?.account || "-"} />
            <InfoRow label={t("twoFactor.secret")} value={setupDetails?.secret || "-"} />
          </MinimalSection>
        ) : null}

        {setup ? (
          <MinimalSection title={t("twoFactor.step2Title")}>
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              label={t("twoFactor.sixDigitCode")}
              onChangeText={setVerificationCode}
              placeholder={t("twoFactor.sixDigitCodePlaceholder")}
              value={verificationCode}
            />

            <AuthSubmitButton
              isPending={isVerifying}
              label={t("twoFactor.verifyEnable")}
              onPress={() => {
                void verifyTwoFactorSetup();
              }}
            />
          </MinimalSection>
        ) : null}

        {setup?.backupCodes.length ? (
          <MinimalSection description={t("twoFactor.recoveryDescription")} title={t("twoFactor.recoveryTitle")}>
            <View className="gap-3">
              {setup.backupCodes.map((backupCode) => (
                <View className="rounded-[20px] border px-4 py-4" key={backupCode} style={{ backgroundColor: theme.inputBackground, borderColor: theme.border }}>
                  <AppText className="text-[15px] font-medium" style={{ color: theme.text }}>{backupCode}</AppText>
                </View>
              ))}
            </View>
          </MinimalSection>
        ) : null}
      </View>

      {message ? (
        <View className="mt-4 rounded-[22px] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
          <AppText className="text-sm leading-6" style={{ color: theme.text }}>{message}</AppText>
        </View>
      ) : null}

      {errorMessage ? (
        <View className="mt-4 rounded-[22px] border border-red-500/25 bg-red-500/10 px-4 py-3">
          <AppText className="text-sm leading-6" style={{ color: theme.danger }}>{errorMessage}</AppText>
        </View>
      ) : null}
    </AuthShell>
  );
}
