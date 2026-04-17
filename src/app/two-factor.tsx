import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/components/auth-input";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DashboardCard } from "@/components/dashboard-card";
import { LoadingScreen } from "@/components/loading-screen";
import { authClient } from "@/lib/auth-client";

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
    });

    setIsEnabling(false);

    if (result.error) {
      setSetup(null);
      setErrorMessage(result.error.message ?? "Could not start the 2FA setup.");
      return;
    }

    if (!result.data) {
      setSetup(null);
      setErrorMessage("The server did not return a TOTP setup payload.");
      return;
    }

    setSetup({
      backupCodes: result.data.backupCodes ?? [],
      totpURI: result.data.totpURI,
    });
    setMessage("2FA setup started. Add the account in your authenticator app, then verify a code.");
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    setMessage(null);

    const result = await authClient.twoFactor.verifyTotp({
      code: verificationCode,
      trustDevice: true,
    });

    setIsVerifying(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? "The verification code was not accepted.");
      return;
    }

    setSetup(null);
    setPassword("");
    setVerificationCode("");
    setMessage("Two-factor authentication is now enabled for your account.");
  };

  const handleDisable = async () => {
    setIsDisabling(true);
    setErrorMessage(null);
    setMessage(null);

    const result = await authClient.twoFactor.disable({
      password,
    });

    setIsDisabling(false);

    if (result.error) {
      setErrorMessage(result.error.message ?? "Could not disable two-factor authentication.");
      return;
    }

    setSetup(null);
    setVerificationCode("");
    setMessage("Two-factor authentication has been disabled.");
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
            Back
          </Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-coral-300">
          Account security
        </Text>
        <Text className="mt-4 text-5xl font-black leading-[56px] text-white">Manage your 2FA.</Text>
        <Text className="mt-4 max-w-[330px] text-base leading-6 text-ink-100">
          Protect {session.user.email} with a TOTP authenticator app and backup recovery codes.
        </Text>

        <View className="mt-10 gap-4">
          <DashboardCard
            eyebrow="Status"
            title={twoFactorEnabled ? "Two-factor is enabled" : "Two-factor is not enabled"}
          >
            <Text className="text-base leading-6 text-ink-100">
              {twoFactorEnabled
                ? "Your account already requires an authenticator code during sign in."
                : "Enter your password to begin setup, then verify the first authenticator code to finish."}
            </Text>
          </DashboardCard>

          <DashboardCard eyebrow="Setup" title="Authenticator app">
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              label="Current password"
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
            />

            {!twoFactorEnabled ? (
              <AuthSubmitButton
                isPending={isEnabling}
                label="Start 2FA setup"
                onPress={() => {
                  void handleEnable();
                }}
              />
            ) : (
              <AuthSubmitButton
                isPending={isDisabling}
                label="Disable 2FA"
                onPress={() => {
                  void handleDisable();
                }}
              />
            )}
          </DashboardCard>

          {setup ? (
            <DashboardCard eyebrow="Step 1" title="Add this account to your authenticator">
              <Text className="text-base leading-6 text-ink-100">
                If your authenticator app supports manual setup, use the values below.
              </Text>

              <View className="mt-4 gap-3">
                <View className="rounded-2xl bg-ink-800/80 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-coral-300">
                    Issuer
                  </Text>
                  <Text className="mt-2 text-base text-white">{setupDetails?.issuer || "-"}</Text>
                </View>

                <View className="rounded-2xl bg-ink-800/80 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-coral-300">
                    Account
                  </Text>
                  <Text className="mt-2 text-base text-white">{setupDetails?.account || "-"}</Text>
                </View>

                <View className="rounded-2xl bg-ink-800/80 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-coral-300">
                    Secret
                  </Text>
                  <Text className="mt-2 text-base text-white">{setupDetails?.secret || "-"}</Text>
                </View>
              </View>
            </DashboardCard>
          ) : null}

          {setup ? (
            <DashboardCard eyebrow="Step 2" title="Verify your authenticator code">
              <AuthInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="number-pad"
                label="6-digit code"
                onChangeText={setVerificationCode}
                placeholder="123456"
                value={verificationCode}
              />

              <AuthSubmitButton
                isPending={isVerifying}
                label="Verify and enable 2FA"
                onPress={() => {
                  void handleVerify();
                }}
              />
            </DashboardCard>
          ) : null}

          {setup?.backupCodes.length ? (
            <DashboardCard eyebrow="Recovery" title="Backup codes">
              <Text className="text-base leading-6 text-ink-100">
                Keep these codes somewhere safe. Each code can be used once if you lose access to your
                authenticator app.
              </Text>

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
