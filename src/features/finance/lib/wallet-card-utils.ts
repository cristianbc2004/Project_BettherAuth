import type { WalletCard, WalletCardNetwork } from "@/features/finance/mocks";

export const walletCardNetworks = ["VISA", "MASTERCARD"] as const satisfies readonly WalletCardNetwork[];
export const walletCardTypes = ["Principal", "Virtual", "Ahorro", "Viajes"] as const;

export type WalletCardFormValues = {
  balance?: string;
  holderName: string;
  lastDigits: string;
  network: WalletCardNetwork;
  type: string;
};

const networkStyles: Record<WalletCardNetwork, Pick<WalletCard, "gradient" | "textColor">> = {
  DIGITAL: {
    gradient: ["#f8f0e3", "#dce9e2", "#6d9b84"],
    textColor: "#17231f",
  },
  MASTERCARD: {
    gradient: ["#221628", "#6b1f4f", "#ff7db4"],
    textColor: "#ffffff",
  },
  VISA: {
    gradient: ["#101827", "#1d3f74", "#6ea8ff"],
    textColor: "#ffffff",
  },
};

function formatBalance(balance?: string) {
  const trimmedBalance = balance?.trim();

  if (!trimmedBalance) {
    return "0 EUR";
  }

  return trimmedBalance.toUpperCase().includes("EUR") ? trimmedBalance : `${trimmedBalance} EUR`;
}

export function buildWalletCardPreview(values: WalletCardFormValues): WalletCard {
  const style = networkStyles[values.network];
  const normalizedHolderName = values.holderName.trim() || "Nuevo titular";

  return {
    balance: formatBalance(values.balance),
    gradient: style.gradient,
    id: `preview-${values.network.toLowerCase()}`,
    lastDigits: values.lastDigits || "0000",
    name: normalizedHolderName,
    network: values.network,
    status: values.type,
    textColor: style.textColor,
  };
}

