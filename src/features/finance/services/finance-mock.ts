import type { ComponentType } from "react";
import {
  Apple,
  Bus,
  Coffee,
  Dumbbell,
  Fuel,
  House,
  Landmark,
  Pill,
  ShoppingBasket,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react-native";

export type WeeklyBalancePoint = {
  label: string;
  value: number;
};

export type WalletCard = {
  balance: string;
  gradient: readonly [string, string, string];
  id: string;
  lastDigits: string;
  name: string;
  network: string;
  status: string;
  textColor: string;
};

export type Transaction = {
  amount: string;
  category: string;
  icon: ComponentType<any>;
  id: string;
  merchant: string;
  time: string;
  tone: "expense" | "income";
};

const TOTAL_TRANSACTION_COUNT = 1500;

export const financeConfig = {
  transactionBatchSize: 40,
  totalTransactionCount: TOTAL_TRANSACTION_COUNT,
} as const;

export const weeklyBalance: WeeklyBalancePoint[] = [
  { label: "Jue", value: 6810 },
  { label: "Vie", value: 7025 },
  { label: "Sab", value: 6968 },
  { label: "Dom", value: 7288 },
  { label: "Lun", value: 7042 },
  { label: "Mar", value: 7176 },
  { label: "Mie", value: 7381 },
];

export const walletCards: WalletCard[] = [
  {
    balance: "3.820 EUR",
    gradient: ["#101827", "#1d3f74", "#6ea8ff"],
    id: "visa-primary",
    lastDigits: "4832",
    name: "Cristian Vega",
    network: "VISA",
    status: "Principal",
    textColor: "#ffffff",
  },
  {
    balance: "1.146 EUR",
    gradient: ["#f8f0e3", "#dce9e2", "#6d9b84"],
    id: "digital",
    lastDigits: "0927",
    name: "Cristian Vega",
    network: "DIGITAL",
    status: "Virtual",
    textColor: "#17231f",
  },
  {
    balance: "812 EUR",
    gradient: ["#232321", "#5a544b", "#d8ad60"],
    id: "savings",
    lastDigits: "7741",
    name: "Ahorro personal",
    network: "VISA",
    status: "Ahorro",
    textColor: "#ffffff",
  },
];

const transactionSeeds = [
  { category: "Cafe y desayuno", icon: Coffee, merchant: "Cafeteria Roma" },
  { category: "Alimentacion", icon: ShoppingBasket, merchant: "Mercadona" },
  { category: "Transporte", icon: Bus, merchant: "Metro Madrid" },
  { category: "Suscripcion", icon: Smartphone, merchant: "Spotify" },
  { category: "Tecnologia", icon: Apple, merchant: "Apple Store" },
  { category: "Salud", icon: Pill, merchant: "Farmacia Central" },
  { category: "Hogar", icon: Zap, merchant: "Iberdrola" },
  { category: "Deporte", icon: Dumbbell, merchant: "Decathlon" },
  { category: "Ingreso recibido", icon: Wallet, merchant: "Bizum de Laura" },
  { category: "Trabajo", icon: Landmark, merchant: "Nomina" },
  { category: "Gasolina", icon: Fuel, merchant: "Repsol" },
  { category: "Compras", icon: House, merchant: "Amazon" },
];

function formatTransactionAmount(value: number) {
  const absoluteValue = Math.abs(value);
  const euros = Math.trunc(absoluteValue);
  const cents = Math.round((absoluteValue - euros) * 100)
    .toString()
    .padStart(2, "0");
  const sign = value >= 0 ? "+" : "-";

  return `${sign}${euros},${cents} EUR`;
}

function buildTransaction(index: number): Transaction {
  const seedIndex = index % transactionSeeds.length;
  const seed = transactionSeeds[seedIndex];
  const isIncome = index % 13 === 0 || seed.merchant === "Bizum de Laura" || seed.merchant === "Nomina";
  const baseAmount = ((index * 37) % 240) + 3;
  const cents = ((index * 19) % 99) / 100;
  const value = isIncome ? baseAmount + 38 + cents : -(baseAmount + cents);
  const dayOffset = Math.floor(index / 9);
  const hour = (11 + index) % 24;
  const minute = (22 + index * 7) % 60;
  const time =
    dayOffset === 0
      ? `Hoy, ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      : `${(29 - (dayOffset % 27)).toString().padStart(2, "0")}/04/2026`;

  return {
    amount: formatTransactionAmount(value),
    category: seed.category,
    icon: seed.icon,
    id: `transaction-${index + 1}`,
    merchant: seed.merchant,
    time,
    tone: isIncome ? "income" : "expense",
  };
}

export const recentTransactions = Array.from({ length: 3 }, (_, index) => buildTransaction(index));

export const allTransactions = Array.from({ length: TOTAL_TRANSACTION_COUNT }, (_, index) =>
  buildTransaction(index),
);
