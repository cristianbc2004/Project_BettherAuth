import type { ComponentType } from "react";

export type WeeklyBalancePoint = {
  label: string;
  value: number;
};

export type WalletCardNetwork = "CHASBACK" | "MASTERCARD" | "ORO" | "VISA";

export type WalletCard = {
  balance: string;
  cvc: string;
  gradient: readonly [string, string, string];
  id: string;
  isBlocked: boolean;
  lastDigits: string;
  name: string;
  numberTarget: string;
  network: WalletCardNetwork;
  status: string;
  textColor: string;
};

export type Transaction = {
  amount: string;
  category: string;
  detail: {
    cardLastDigits: string;
    concept: string;
    date: string;
    reference: string;
    status: "Completado" | "Pendiente";
  };
  icon: ComponentType<any>;
  id: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  merchant: string;
  time: string;
  tone: "expense" | "income";
};
