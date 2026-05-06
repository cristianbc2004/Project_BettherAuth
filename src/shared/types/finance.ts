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
  icon: ComponentType<any>;
  id: string;
  merchant: string;
  time: string;
  tone: "expense" | "income";
};
