import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/features/auth/components/auth-input";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { DashboardCard } from "@/shared/components/ui/dashboard-card";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { buildAuthFetchOptions, useLanguage } from "@/shared/lib/locale";

type TwoFactorSetup = {
  backupCodes: string[];
  totpURI: string;
};

function extractSetupDetails(totpURI: string) {
  try {
    const parsed = new URL(totpURI);
    const account = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    const secret = parsed.searchParams.get("secret") ?? "";
    const issuer = parsed.searchParams.get("issuer") ?? "Better Auth";

    return {
      account,
      issuer,
      secret,
    };
  } catch {
    return {
      account: "",
      issuer: "Better Auth",
      secret: "",
    };
  }
}

export default function TwoFactorScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const twoFactorEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled,
  );

  const setupDetails = useMemo(() => {
    return setup ? extractSetupDetails(setup.totpURI) : null;
  }, [setup]);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  const handleEnable = async () => {
    setIsEnabling(true);
    setErrorMessage(null);
    setMessage(null);

    const result = await authClient.twoFactor.enable({
      password,
      issuer: "Better Auth Dashboard",
      ...buildAuthFetchOptions(locale),
    });

    setIsEnabling(false);

    if (result.error) {
      setSetup(null);
      setErrorMessage(result.error.message ?? t("twoFactor.enableError"));
      return;
    }

    if (!result.data) {
      setSetup(null);
      setErrorMessage(t("twoFactor.missingSetupPayload"));
      return;
    }

    setSetup({
      backupCodes: result.data.backupCodes ?? [],
      totpURI: result.data.totpURI,
    });
    setMessage(t("twoFactor.setupStarted"));
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    setMessage(null);

    const result = await authClient.twoFactor.verifyTotp({
      code: verificationCode,
      trustDevice: true,
      ...buildAuthFetchOptions(locale),
    });

    setIsVerifying(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? t("twoFactor.verifyError"));
      return;
    }

    setSetup(null);
    setPassword("");
    setVerificationCode("");
    setMessage(t("twoFactor.enableSuccess"));
  };

  const handleDisable = async () => {
    setIsDisabling(true);
    setErrorMessage(null);
    setMessage(null);

    const result = await authClient.twoFactor.disable({
      password,
      ...buildAuthFetchOptions(locale),
    });

    setIsDisabling(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? t("twoFactor.disableError"));
      return;
    }

    setSetup(null);
    setVerificationCode("");
    setMessage(t("twoFactor.disableSuccess"));
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-900">
      <ScrollView
        bounces={false}
        contentContainerClassName="px-6 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          className="mb-6 self-start"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
            {t("common.back")}
          </Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          {t("twoFactor.eyebrow")}
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">{t("twoFactor.title")}</Text>
        <Text className="mt-4 max-w-[330px] text-base leading-6 text-ink-100">
          {t("twoFactor.subtitle", { email: session.user.email })}
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard
            eyebrow={t("twoFactor.statusEyebrow")}
            title={twoFactorEnabled ? t("twoFactor.statusEnabled") : t("twoFactor.statusDisabled")}
          >
            <Text className="text-base leading-6 text-ink-100">
              {twoFactorEnabled
                ? t("twoFactor.statusEnabledDescription")
                : t("twoFactor.statusDisabledDescription")}
            </Text>
          </DashboardCard>

          <DashboardCard eyebrow={t("twoFactor.setupEyebrow")} title={t("twoFactor.setupTitle")}>
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label={t("twoFactor.currentPassword")}
              onChangeText={setPassword}
              placeholder={t("twoFactor.currentPasswordPlaceholder")}
              secureTextEntry
              value={password}
            />

            {!twoFactorEnabled ? (
              <AuthSubmitButton
                isPending={isEnabling}
                label={t("twoFactor.startSetup")}
                onPress={() => {
                  void handleEnable();
                }}
              />
            ) : (
              <AuthSubmitButton
                isPending={isDisabling}
                label={t("twoFactor.disable2fa")}
                onPress={() => {
                  void handleDisable();
                }}
              />
            )}
          </DashboardCard>

          {setup ? (
            <DashboardCard eyebrow={t("twoFactor.step1Eyebrow")} title={t("twoFactor.step1Title")}>
              <Text className="text-base leading-6 text-ink-100">
                {t("twoFactor.step1Description")}
              </Text>

              <View className="mt-4 gap-3">
                <View className="rounded-2xl bg-ink-800/80 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-coral-300">
                    {t("twoFactor.issuer")}
                  </Text>
                  <Text className="mt-2 text-base text-white">{setupDetails?.issuer || "-"}</Text>
                </View>

                <View className="rounded-2xl bg-ink-800/80 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-coral-300">
                    {t("twoFactor.account")}
                  </Text>
                  <Text className="mt-2 text-base text-white">{setupDetails?.account || "-"}</Text>
                </View>

                <View className="rounded-2xl bg-ink-800/80 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-coral-300">
                    {t("twoFactor.secret")}
                  </Text>
                  <Text className="mt-2 text-base text-white">{setupDetails?.secret || "-"}</Text>
                </View>
              </View>
            </DashboardCard>
          ) : null}

          {setup ? (
            <DashboardCard eyebrow={t("twoFactor.step2Eyebrow")} title={t("twoFactor.step2Title")}>
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
                  void handleVerify();
                }}
              />
            </DashboardCard>
          ) : null}

          {setup?.backupCodes.length ? (
            <DashboardCard eyebrow={t("twoFactor.recoveryEyebrow")} title={t("twoFactor.recoveryTitle")}>
              <Text className="text-base leading-6 text-ink-100">{t("twoFactor.recoveryDescription")}</Text>

              <View className="mt-4 flex-row flex-wrap gap-3">
                {setup.backupCodes.map((backupCode) => (
                  <View className="rounded-2xl bg-ink-800/80 px-4 py-3" key={backupCode}>
                    <Text className="text-base font-semibold text-white">{backupCode}</Text>
                  </View>
                ))}
              </View>
            </DashboardCard>
          ) : null}

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
