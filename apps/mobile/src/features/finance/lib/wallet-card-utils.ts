import type { WalletCard, WalletCardNetwork } from "@repo/types/finance";
import { z } from "zod";

export const walletCardTypes = ["VISA", "MASTERCARD", "CHASBACK", "ORO"] as const satisfies readonly WalletCardNetwork[];

export const walletCardFormSchema = z.object({
  cvc: z.string(),
  initialBalanceCents: z.number(),
  name: z.string(),
  numberTarget: z.string(),
  type: z.enum(walletCardTypes),
});

export const addTargetSchema = z.object({
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "The CVC must have 3 or 4 digits."),
  initialBalance: z
    .string()
    .trim()
    .min(1, "Enter the initial balance.")
    .refine((value) => parseAmountInputToCents(value) !== null, "Enter a valid amount."),
  name: z.string().trim().min(2, "Enter the card name."),
  numberTarget: z
    .string()
    .trim()
    .regex(/^\d{12,19}$/, "The card number must have between 12 and 19 digits."),
  type: z.enum(walletCardTypes),
});

export type WalletCardFormValues = z.infer<typeof walletCardFormSchema>;
export type AddTargetFormValues = z.infer<typeof addTargetSchema>;

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

export function normalizeAmountInput(value: string) {
  const compactValue = value.trim().replace(",", ".");
  const digitsAndDotOnly = compactValue.replace(/[^\d.]/g, "");
  const [wholePartRaw, ...decimalParts] = digitsAndDotOnly.split(".");
  const wholePart = wholePartRaw.replace(/^0+(?=\d)/, "") || "0";
  const decimals = decimalParts.join("").slice(0, 2);

  if (!digitsAndDotOnly.includes(".")) {
    return wholePart;
  }

  return `${wholePart}.${decimals}`;
}

export function parseAmountInputToCents(value: string) {
  const normalizedValue = normalizeAmountInput(value);
  const amount = Number.parseFloat(normalizedValue);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function buildWalletCardPayload(values: AddTargetFormValues) {
  const initialBalanceCents = parseAmountInputToCents(values.initialBalance);

  if (initialBalanceCents === null) {
    return null;
  }

  return walletCardFormSchema.parse({
    cvc: values.cvc,
    initialBalanceCents,
    name: values.name,
    numberTarget: values.numberTarget,
    type: values.type,
  });
}

export function formatEurosFromCents(cents: number) {
  return `${(Math.max(0, cents) / 100).toFixed(2).replace(".", ",")} EUR`;
}

export function buildWalletCardPreview(values: WalletCardFormValues): WalletCard {
  const style = networkStyles[values.type];
  const normalizedName = values.name.trim() || "Nuevo target";
  const normalizedNumber = values.numberTarget.replace(/\D/g, "");

  return {
    balance: formatEurosFromCents(values.initialBalanceCents),
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
  balanceCents: number;
  block: boolean;
  cvc: string;
  id: string;
  name: string;
  numberTarget: string;
  type: WalletCardNetwork;
}): WalletCard {
  const card = buildWalletCardPreview({
    cvc: target.cvc,
    initialBalanceCents: target.balanceCents,
    name: target.name,
    numberTarget: target.numberTarget,
    type: target.type,
  });

  return {
    ...card,
    balance: target.block
      ? `Bloqueada - ${formatEurosFromCents(target.balanceCents)}`
      : formatEurosFromCents(target.balanceCents),
    id: target.id,
    isBlocked: target.block,
  };
}
