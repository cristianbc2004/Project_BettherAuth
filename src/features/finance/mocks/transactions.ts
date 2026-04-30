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

import type { Transaction } from "@/features/finance/mocks/types";

const TOTAL_TRANSACTION_COUNT = 1500;

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

export const financeConfig = {
  transactionBatchSize: 40,
  totalTransactionCount: TOTAL_TRANSACTION_COUNT,
} as const;

export const recentTransactions = Array.from({ length: 3 }, (_, index) => buildTransaction(index));

export const allTransactions = Array.from({ length: TOTAL_TRANSACTION_COUNT }, (_, index) =>
  buildTransaction(index),
);
