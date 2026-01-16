import type { Transaction } from '@/types';
import { isSameMerchant, normalizeMerchantForComparison } from './merchant-aliases';

export interface DuplicateCandidate {
  newTransaction: Transaction;
  existingTransaction: Transaction;
  confidence: number;
  matchType: 'exact' | 'likely' | 'possible';
}

export interface InternalDuplicateCandidate {
  transaction1: Transaction;
  transaction2: Transaction;
  confidence: number;
  matchType: 'exact' | 'likely' | 'possible';
  isLegitimate: boolean;
}

export interface DuplicateDetectionResult {
  unique: Transaction[];
  duplicates: DuplicateCandidate[];
}

export interface InternalDuplicateDetectionResult {
  transactions: Transaction[];
  internalDuplicates: InternalDuplicateCandidate[];
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  // Simple contains check
  if (aLower.includes(bLower) || bLower.includes(aLower)) {
    return 0.9;
  }

  // Word-based similarity
  const aWords = new Set(aLower.split(/\s+/));
  const bWords = new Set(bLower.split(/\s+/));
  const intersection = new Set([...aWords].filter(x => bWords.has(x)));
  const union = new Set([...aWords, ...bWords]);

  return intersection.size / union.size;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Find the best matching existing transaction for a new transaction
 */
function findBestMatch(
  newTxn: Transaction,
  existing: Transaction[]
): DuplicateCandidate | null {
  for (const existingTxn of existing) {
    // Exact match: same date, amount, and description
    if (
      isSameDay(newTxn.date, existingTxn.date) &&
      Math.abs(newTxn.amount - existingTxn.amount) < 0.01 &&
      newTxn.descripcion === existingTxn.descripcion
    ) {
      return {
        newTransaction: newTxn,
        existingTransaction: existingTxn,
        confidence: 1.0,
        matchType: 'exact',
      };
    }

    // Likely match: same date and amount, similar description
    if (
      isSameDay(newTxn.date, existingTxn.date) &&
      Math.abs(newTxn.amount - existingTxn.amount) < 0.01
    ) {
      const similarity = stringSimilarity(newTxn.descripcion, existingTxn.descripcion);
      if (similarity > 0.8) {
        return {
          newTransaction: newTxn,
          existingTransaction: existingTxn,
          confidence: 0.95,
          matchType: 'likely',
        };
      }
      if (similarity > 0.6) {
        return {
          newTransaction: newTxn,
          existingTransaction: existingTxn,
          confidence: 0.8,
          matchType: 'possible',
        };
      }
    }

    // Possible match: same amount within a day, similar merchant
    const dayDiff = Math.abs(newTxn.date.getTime() - existingTxn.date.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff <= 1 && Math.abs(newTxn.amount - existingTxn.amount) < 0.01) {
      // Use merchant alias system for better matching
      if (isSameMerchant(newTxn.descripcion, existingTxn.descripcion)) {
        return {
          newTransaction: newTxn,
          existingTransaction: existingTxn,
          confidence: 0.75,
          matchType: 'possible',
        };
      }

      const merchantSimilarity = stringSimilarity(newTxn.merchant, existingTxn.merchant);
      if (merchantSimilarity > 0.7) {
        return {
          newTransaction: newTxn,
          existingTransaction: existingTxn,
          confidence: 0.7,
          matchType: 'possible',
        };
      }
    }
  }

  return null;
}

/**
 * Detect duplicate transactions between new and existing transactions
 */
export function detectDuplicates(
  newTransactions: Transaction[],
  existingTransactions: Transaction[]
): DuplicateDetectionResult {
  const duplicates: DuplicateCandidate[] = [];
  const unique: Transaction[] = [];

  for (const newTxn of newTransactions) {
    const match = findBestMatch(newTxn, existingTransactions);

    if (match && match.confidence > 0.7) {
      duplicates.push(match);
    } else {
      unique.push(newTxn);
    }
  }

  return { unique, duplicates };
}

/**
 * Get statistics about the detection result
 */
export function getDuplicateStats(result: DuplicateDetectionResult): {
  total: number;
  unique: number;
  exact: number;
  likely: number;
  possible: number;
} {
  const exact = result.duplicates.filter(d => d.matchType === 'exact').length;
  const likely = result.duplicates.filter(d => d.matchType === 'likely').length;
  const possible = result.duplicates.filter(d => d.matchType === 'possible').length;

  return {
    total: result.unique.length + result.duplicates.length,
    unique: result.unique.length,
    exact,
    likely,
    possible,
  };
}

/**
 * Get enhanced statistics including internal duplicates
 */
export function getEnhancedDuplicateStats(result: InternalDuplicateDetectionResult): {
  total: number;
  internalDuplicates: number;
  internalExact: number;
  internalLikely: number;
  internalPossible: number;
  internalLegitimate: number;
} {
  const internalExact = result.internalDuplicates.filter(d => d.matchType === 'exact').length;
  const internalLikely = result.internalDuplicates.filter(d => d.matchType === 'likely').length;
  const internalPossible = result.internalDuplicates.filter(d => d.matchType === 'possible').length;
  const internalLegitimate = result.internalDuplicates.filter(d => d.isLegitimate).length;

  return {
    total: result.transactions.length,
    internalDuplicates: result.internalDuplicates.length,
    internalExact,
    internalLikely,
    internalPossible,
    internalLegitimate,
  };
}

/**
 * Check if two transactions are legitimately separate despite appearing similar
 * Subscriptions can have same-day same-amount charges legitimately
 */
export function areLegitimatelySeparate(txn1: Transaction, txn2: Transaction): boolean {
  const merchant1 = normalizeMerchantForComparison(txn1.descripcion);
  const merchant2 = normalizeMerchantForComparison(txn2.descripcion);

  // Known subscription services that can have legitimate same-day duplicates
  const subscriptionPatterns = [
    /CLAUDE\.AI/i,
    /ANTHROPIC/i,
    /OPENAI/i,
    /CHATGPT/i,
    /NETFLIX/i,
    /SPOTIFY/i,
    /YOUTUBE/i,
    /GOOGLE ONE/i,
    /HBOMAX/i,
    /DISNEY PLUS/i,
    /AMAZONPRIME/i,
  ];

  const isSubscription1 = subscriptionPatterns.some(p => p.test(txn1.descripcion));
  const isSubscription2 = subscriptionPatterns.some(p => p.test(txn2.descripcion));

  // If both are subscriptions to the same service with exact same amount on same day,
  // it could be a billing issue or plan change - flag as potentially legitimate
  if (isSubscription1 && isSubscription2 && merchant1 === merchant2) {
    return true;
  }

  return false;
}

/**
 * Detect duplicate transactions within the same batch (internal duplicates)
 * This is useful for finding duplicates within a CSV upload before comparing to existing data
 */
export function detectInternalDuplicates(
  transactions: Transaction[]
): InternalDuplicateDetectionResult {
  const internalDuplicates: InternalDuplicateCandidate[] = [];
  const seen = new Map<string, Transaction[]>();

  // Group by potential duplicate key (date + amount)
  for (const txn of transactions) {
    const dateKey = `${txn.date.getFullYear()}-${txn.date.getMonth()}-${txn.date.getDate()}`;
    const amountKey = txn.amount.toFixed(2);
    const key = `${dateKey}:${amountKey}`;

    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(txn);
  }

  // Find duplicates within each group
  for (const [_key, group] of seen.entries()) {
    if (group.length < 2) continue;

    // Compare each transaction with others in the group
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const txn1 = group[i];
        const txn2 = group[j];

        // Exact match: same date, amount, and description
        if (txn1.descripcion === txn2.descripcion) {
          internalDuplicates.push({
            transaction1: txn1,
            transaction2: txn2,
            confidence: 1.0,
            matchType: 'exact',
            isLegitimate: areLegitimatelySeparate(txn1, txn2),
          });
          continue;
        }

        // Use merchant alias system for better matching
        if (isSameMerchant(txn1.descripcion, txn2.descripcion)) {
          const similarity = stringSimilarity(txn1.descripcion, txn2.descripcion);

          if (similarity > 0.8) {
            internalDuplicates.push({
              transaction1: txn1,
              transaction2: txn2,
              confidence: 0.95,
              matchType: 'likely',
              isLegitimate: areLegitimatelySeparate(txn1, txn2),
            });
          } else if (similarity > 0.6) {
            internalDuplicates.push({
              transaction1: txn1,
              transaction2: txn2,
              confidence: 0.8,
              matchType: 'possible',
              isLegitimate: areLegitimatelySeparate(txn1, txn2),
            });
          }
        }
      }
    }
  }

  return {
    transactions,
    internalDuplicates,
  };
}
