import { useMemo, useState } from "react";

import { authClient } from "@/features/auth/services/auth-client";
import { successHaptic, warningHaptic } from "@/shared/lib/haptics";
import { buildAuthFetchOptions, type AppLocale } from "@/shared/lib/locale";

type Translate = (key: string) => string;

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

export function useTwoFactorSettings(t: Translate, locale: AppLocale) {
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const setupDetails = useMemo(() => {
    return setup ? extractSetupDetails(setup.totpURI) : null;
  }, [setup]);

  const enableTwoFactor = async () => {
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
      warningHaptic();
      return;
    }

    if (!result.data) {
      setSetup(null);
      setErrorMessage(t("twoFactor.missingSetupPayload"));
      warningHaptic();
      return;
    }

    setSetup({
      backupCodes: result.data.backupCodes ?? [],
      totpURI: result.data.totpURI,
    });
    setMessage(t("twoFactor.setupStarted"));
    successHaptic();
  };

  const verifyTwoFactorSetup = async () => {
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
      warningHaptic();
      return;
    }

    setSetup(null);
    setPassword("");
    setVerificationCode("");
    setMessage(t("twoFactor.enableSuccess"));
    successHaptic();
  };

  const disableTwoFactor = async () => {
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
      warningHaptic();
      return;
    }

    setSetup(null);
    setVerificationCode("");
    setMessage(t("twoFactor.disableSuccess"));
    successHaptic();
  };

  return {
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
  };
}
