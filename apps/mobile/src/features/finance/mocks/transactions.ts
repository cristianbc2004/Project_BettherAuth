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

import type { Transaction } from "@repo/types/finance";

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

const cardLastDigits = ["8979", "9489", "2469", "3887"];

const merchantLocations: Record<string, Transaction["location"]> = {
  "Amazon": {
    address: "Calle de Orense 34, Madrid",
    latitude: 40.4528,
    longitude: -3.6945,
  },
  "Apple Store": {
    address: "Puerta del Sol 1, Madrid",
    latitude: 40.4169,
    longitude: -3.7035,
  },
  "Bizum de Laura": {
    address: "Plaza de Espana, Madrid",
    latitude: 40.423,
    longitude: -3.7122,
  },
  "Cafeteria Roma": {
    address: "Calle de Alcala 96, Madrid",
    latitude: 40.4216,
    longitude: -3.6818,
  },
  "Decathlon": {
    address: "Calle de Preciados 10, Madrid",
    latitude: 40.4181,
    longitude: -3.7058,
  },
  "Farmacia Central": {
    address: "Calle de Atocha 45, Madrid",
    latitude: 40.4132,
    longitude: -3.7007,
  },
  "Iberdrola": {
    address: "Paseo de la Castellana 20, Madrid",
    latitude: 40.4307,
    longitude: -3.6899,
  },
  "Mercadona": {
    address: "Calle de Fuencarral 77, Madrid",
    latitude: 40.4252,
    longitude: -3.7004,
  },
  "Metro Madrid": {
    address: "Estacion Gran Via, Madrid",
    latitude: 40.42,
    longitude: -3.7018,
  },
  "Nomina": {
    address: "Avenida de America 6, Madrid",
    latitude: 40.438,
    longitude: -3.6769,
  },
  "Repsol": {
    address: "Calle de Mateo Inurria 15, Madrid",
    latitude: 40.4667,
    longitude: -3.6889,
  },
  "Spotify": {
    address: "Calle Serrano 41, Madrid",
    latitude: 40.4261,
    longitude: -3.6879,
  },
};

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
    detail: {
      cardLastDigits: cardLastDigits[index % cardLastDigits.length],
      concept: isIncome ? `Ingreso de ${seed.merchant}` : `Pago en ${seed.merchant}`,
      date:
        dayOffset === 0
          ? `29/04/2026, ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          : `${(29 - (dayOffset % 27)).toString().padStart(2, "0")}/04/2026, ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      reference: `NXM-${(2026040000 + index * 37).toString()}`,
      status: index % 17 === 0 ? "Pendiente" : "Completado",
    },
    icon: seed.icon,
    id: `transaction-${index + 1}`,
    location: merchantLocations[seed.merchant],
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
