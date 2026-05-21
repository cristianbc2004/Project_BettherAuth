import { mockIngresos, type IncomePerson } from "@/features/ingresos/mocks";
import type { AppTheme } from "@/shared/lib/theme-tokens";

export function formatPersonCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatPersonSaleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function formatPersonLastUpdated(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function parsePersonId(personId?: string) {
  const selectedPersonId = personId ? Number(personId) : undefined;

  return Number.isFinite(selectedPersonId) ? selectedPersonId : undefined;
}

export function getSelectedPersonId(personId?: string, fallbackPersonId?: number) {
  return parsePersonId(personId) ?? fallbackPersonId;
}

export function getSelectedPerson(personId?: number) {
  return (
    mockIngresos.detalles.find((person) => person.id === personId) ??
    mockIngresos.detalles[0]
  );
}

export function getPersonGeneralHref(personId?: number) {
  return personId ? (`/person?personId=${personId}` as const) : "/person";
}

export function getPersonStatusLabel(status: IncomePerson["location"]["status"]) {
  switch (status) {
    case "moving":
      return "On route";
    case "offline":
      return "Offline";
    case "online":
    default:
      return "Available";
  }
}

export function getPersonStatusColors(
  status: IncomePerson["location"]["status"],
  theme: AppTheme,
) {
  switch (status) {
    case "moving":
      return {
        accent: theme.primary,
        soft: theme.primarySoft,
      };
    case "offline":
      return {
        accent: theme.danger,
        soft: "rgba(220, 38, 38, 0.14)",
      };
    case "online":
    default:
      return {
        accent: theme.success,
        soft: "rgba(5, 150, 105, 0.14)",
      };
  }
}
