import type { Transaction } from "@/features/finance/mocks";

export type MovementToneFilter = "all" | Transaction["tone"];

export function normalizeMovementSearchQuery(searchQuery: string) {
  return searchQuery.trim().toLowerCase();
}

export function filterTransactions(
  transactions: Transaction[],
  searchQuery: string,
  selectedTone: MovementToneFilter,
) {
  const normalizedQuery = normalizeMovementSearchQuery(searchQuery);

  return transactions.filter((transaction) => {
    const matchesSearch =
      !normalizedQuery ||
      `${transaction.merchant} ${transaction.category} ${transaction.amount} ${transaction.time}`
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesTone = selectedTone === "all" || transaction.tone === selectedTone;

    return matchesSearch && matchesTone;
  });
}

export function getVisibleTransactions(
  filteredTransactions: Transaction[],
  searchQuery: string,
  visibleCount: number,
) {
  if (normalizeMovementSearchQuery(searchQuery)) {
    return filteredTransactions;
  }

  return filteredTransactions.slice(0, visibleCount);
}

export function getHasMoreTransactions(
  searchQuery: string,
  visibleCount: number,
  totalTransactionCount: number,
) {
  return !normalizeMovementSearchQuery(searchQuery) && visibleCount < totalTransactionCount;
}

export function getNextVisibleCount(
  currentCount: number,
  batchSize: number,
  totalTransactionCount: number,
) {
  return Math.min(currentCount + batchSize, totalTransactionCount);
}
