import type { ComponentType } from "react";

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
