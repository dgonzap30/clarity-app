import type { Transaction } from '@/types';

const STORAGE_KEY = 'spending-dashboard-transactions';

/**
 * Serializes transactions for localStorage storage.
 * Converts Date objects to ISO strings.
 */
function serializeTransactions(transactions: Transaction[]): string {
  const serialized = transactions.map((t) => ({
    ...t,
    date: t.date.toISOString(),
    purchaseDate: t.purchaseDate.toISOString(),
  }));
  return JSON.stringify(serialized);
}

/**
 * Deserializes transactions from localStorage.
 * Converts ISO strings back to Date objects.
 */
function deserializeTransactions(data: string): Transaction[] {
  const parsed = JSON.parse(data);
  return parsed.map((t: any) => ({
    ...t,
    date: new Date(t.date),
    purchaseDate: new Date(t.purchaseDate),
  }));
}

/**
 * Saves transactions to localStorage.
 */
export function saveTransactions(transactions: Transaction[]): void {
  try {
    const serialized = serializeTransactions(transactions);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save transactions to localStorage:', error);
  }
}

/**
 * Loads transactions from localStorage.
 * Returns null if no data exists or if parsing fails.
 */
export function loadTransactions(): Transaction[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return deserializeTransactions(data);
  } catch (error) {
    console.error('Failed to load transactions from localStorage:', error);
    return null;
  }
}

/**
 * Clears all transactions from localStorage.
 */
export function clearTransactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear transactions from localStorage:', error);
  }
}
