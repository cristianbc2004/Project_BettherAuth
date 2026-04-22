import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { authClient } from "@/features/auth/services/auth-client";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
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

function MinimalSection({
  children,
  description,
  title,
}: {
  children?: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <View className="border-t border-white/6 px-4 py-5">
      <Text className="text-base font-semibold text-white">{title}</Text>
      {description ? <Text className="mt-2 text-[15px] leading-6 text-white/60">{description}</Text> : null}
      {children ? <View className="mt-5">{children}</View> : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3 rounded-[20px] border border-white/6 bg-white/[0.04] px-4 py-4">
      <Text className="text-xs font-medium uppercase tracking-[1.2px] text-white/45">{label}</Text>
      <Text className="mt-2 text-[15px] text-white">{value || "-"}</Text>
    </View>
  );
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
    <AuthShell
      eyebrow=""
      subtitle={`Manage two-factor authentication for ${session.user.email} with the same minimal secure flow.`}
      title="Two-Factor Authentication."
    >
      <View className="overflow-hidden rounded-[30px] border border-white/6 bg-[#0b1220]/40">
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
                void handleDisable();
                return;
              }

              void handleEnable();
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
                void handleVerify();
              }}
            />
          </MinimalSection>
        ) : null}

        {setup?.backupCodes.length ? (
          <MinimalSection description={t("twoFactor.recoveryDescription")} title={t("twoFactor.recoveryTitle")}>
            <View className="gap-3">
              {setup.backupCodes.map((backupCode) => (
                <View className="rounded-[20px] border border-white/6 bg-white/[0.04] px-4 py-4" key={backupCode}>
                  <Text className="text-[15px] font-medium text-white">{backupCode}</Text>
                </View>
              ))}
            </View>
          </MinimalSection>
        ) : null}
      </View>

      {message ? (
        <View className="mt-4 rounded-[22px] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
          <Text className="text-sm leading-6 text-white">{message}</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View className="mt-4 rounded-[22px] border border-red-500/25 bg-red-500/10 px-4 py-3">
          <Text className="text-sm leading-6 text-white">{errorMessage}</Text>
        </View>
      ) : null}
    </AuthShell>
  );
}
