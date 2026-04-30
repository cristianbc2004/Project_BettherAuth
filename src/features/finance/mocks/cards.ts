import type { WalletCard } from "@/features/finance/mocks/types";

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
  {
    balance: "2.465 EUR",
    gradient: ["#221628", "#6b1f4f", "#ff7db4"],
    id: "travel",
    lastDigits: "1284",
    name: "Viajes",
    network: "MASTERCARD",
    status: "Travel",
    textColor: "#ffffff",
  },
];
