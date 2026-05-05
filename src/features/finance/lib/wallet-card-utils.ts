import type { WalletCard, WalletCardNetwork } from "@/features/finance/mocks";

export const walletCardTypes = ["VISA", "MASTERCARD", "CHASBACK", "ORO"] as const satisfies readonly WalletCardNetwork[];

export type WalletCardFormValues = {
  cvc: string;
  name: string;
  numberTarget: string;
  type: WalletCardNetwork;
};

const networkStyles: Record<WalletCardNetwork, Pick<WalletCard, "gradient" | "textColor">> = {
  CHASBACK: {
    gradient: ["#f8f0e3", "#dce9e2", "#6d9b84"],
    textColor: "#17231f",
  },
  MASTERCARD: {
    gradient: ["#221628", "#6b1f4f", "#ff7db4"],
    textColor: "#ffffff",
  },
  ORO: {
    gradient: ["#232321", "#5a544b", "#d8ad60"],
    textColor: "#ffffff",
  },
  VISA: {
    gradient: ["#101827", "#1d3f74", "#6ea8ff"],
    textColor: "#ffffff",
  },
};

export function buildWalletCardPreview(values: WalletCardFormValues): WalletCard {
  const style = networkStyles[values.type];
  const normalizedName = values.name.trim() || "Nuevo target";
  const normalizedNumber = values.numberTarget.replace(/\D/g, "");

  return {
    balance: "Target activo",
    cvc: values.cvc,
    gradient: style.gradient,
    id: `preview-${values.type.toLowerCase()}`,
    isBlocked: false,
    lastDigits: normalizedNumber.slice(-4).padStart(4, "0"),
    name: normalizedName,
    network: values.type,
    numberTarget: normalizedNumber,
    status: values.type,
    textColor: style.textColor,
  };
}

export function mapTargetToWalletCard(target: {
  block: boolean;
  cvc: string;
  id: string;
  name: string;
  numberTarget: string;
  type: WalletCardNetwork;
}): WalletCard {
  const card = buildWalletCardPreview({
    cvc: target.cvc,
    name: target.name,
    numberTarget: target.numberTarget,
    type: target.type,
  });

  return {
    ...card,
    balance: target.block ? "Target bloqueado" : "Target activo",
    id: target.id,
    isBlocked: target.block,
  };
}
