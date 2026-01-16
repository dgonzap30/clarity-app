/**
 * Category suggestion engine
 * Generates intelligent category suggestions based on merchant similarity,
 * learned patterns, and transaction history
 */

import type { Transaction, CategoryId } from '@/types';
import type { LearnedPattern, SuggestionSettings } from '@/types/settings';
import { normalizeMerchantName, fuzzyMatch } from './fuzzy-match';

export interface CategorySuggestion {
  categoryId: CategoryId;
  confidence: number;
  reason: 'similar_merchant' | 'learned_pattern' | 'amount_pattern' | 'exact_match';
  details?: string;
}

/**
 * Analyzes similar merchants in transaction history
 */
function findSimilarMerchants(
  merchantName: string,
  transactions: Transaction[],
  minSimilarity = 0.7
): Map<CategoryId, { count: number; avgConfidence: number; merchants: string[] }> {
  const normalizedSearch = normalizeMerchantName(merchantName);
  const categoryCounts = new Map<
    CategoryId,
    { count: number; totalConfidence: number; merchants: Set<string> }
  >();

  for (const tx of transactions) {
    const normalizedMerchant = normalizeMerchantName(tx.merchant);

    // Skip if it's the same merchant (we're looking for similar ones)
    if (normalizedMerchant === normalizedSearch) continue;

    // Calculate similarity
    const similarity = fuzzyMatch(normalizedSearch, normalizedMerchant, {
      normalizeFirst: false, // Already normalized
    });

    if (similarity >= minSimilarity) {
      const existing = categoryCounts.get(tx.category.id) || {
        count: 0,
        totalConfidence: 0,
        merchants: new Set<string>(),
      };

      existing.count++;
      existing.totalConfidence += similarity;
      existing.merchants.add(tx.merchant);
      categoryCounts.set(tx.category.id, existing);
    }
  }

  // Convert to final format with average confidence
  const result = new Map<
    CategoryId,
    { count: number; avgConfidence: number; merchants: string[] }
  >();

  for (const [categoryId, data] of categoryCounts.entries()) {
    result.set(categoryId, {
      count: data.count,
      avgConfidence: data.totalConfidence / data.count,
      merchants: Array.from(data.merchants),
    });
  }

  return result;
}

/**
 * Analyzes amount patterns for the merchant
 */
function findAmountPatterns(
  amount: number,
  transactions: Transaction[],
  tolerance = 0.1 // 10% tolerance
): Map<CategoryId, { count: number; avgDiff: number }> {
  const patterns = new Map<CategoryId, { count: number; totalDiff: number }>();

  for (const tx of transactions) {
    const diff = Math.abs(tx.amount - amount) / amount;
    if (diff <= tolerance) {
      const existing = patterns.get(tx.category.id) || { count: 0, totalDiff: 0 };
      existing.count++;
      existing.totalDiff += diff;
      patterns.set(tx.category.id, existing);
    }
  }

  // Convert to final format with average difference
  const result = new Map<CategoryId, { count: number; avgDiff: number }>();
  for (const [categoryId, data] of patterns.entries()) {
    result.set(categoryId, {
      count: data.count,
      avgDiff: data.totalDiff / data.count,
    });
  }

  return result;
}

/**
 * Checks learned patterns for matches
 */
function checkLearnedPatterns(
  merchantName: string,
  learnedPatterns: LearnedPattern[]
): CategorySuggestion[] {
  const suggestions: CategorySuggestion[] = [];
  const normalizedSearch = normalizeMerchantName(merchantName);

  for (const pattern of learnedPatterns) {
    const normalizedPattern = normalizeMerchantName(pattern.merchantPattern);

    // Check for exact match
    if (normalizedPattern === normalizedSearch) {
      suggestions.push({
        categoryId: pattern.categoryId,
        confidence: Math.min(0.95, pattern.confidence + 0.1), // Boost exact matches
        reason: 'exact_match',
        details: `Learned from ${pattern.occurrences} previous corrections`,
      });
      continue;
    }

    // Check for fuzzy match
    const similarity = fuzzyMatch(normalizedSearch, normalizedPattern, {
      normalizeFirst: false,
    });

    if (similarity >= 0.7) {
      // Adjust confidence based on pattern strength and similarity
      const adjustedConfidence = pattern.confidence * similarity * 0.9;

      if (adjustedConfidence >= 0.6) {
        suggestions.push({
          categoryId: pattern.categoryId,
          confidence: adjustedConfidence,
          reason: 'learned_pattern',
          details: `Similar to "${pattern.merchantPattern}" (${pattern.occurrences} occurrences)`,
        });
      }
    }
  }

  return suggestions;
}

/**
 * Generates category suggestions for a transaction
 */
export function generateSuggestions(
  merchant: string,
  amount: number,
  transactions: Transaction[],
  learnedPatterns: LearnedPattern[],
  settings: SuggestionSettings
): CategorySuggestion[] {
  if (!settings.enableSuggestions) {
    return [];
  }

  const allSuggestions: CategorySuggestion[] = [];

  // 1. Check learned patterns (highest priority)
  const patternSuggestions = checkLearnedPatterns(merchant, learnedPatterns);
  allSuggestions.push(...patternSuggestions);

  // 2. Find similar merchants
  const similarMerchants = findSimilarMerchants(merchant, transactions, 0.7);
  for (const [categoryId, data] of similarMerchants.entries()) {
    // Skip if we already have this category from learned patterns with higher confidence
    const existingPattern = allSuggestions.find(
      (s) => s.categoryId === categoryId && s.reason === 'exact_match'
    );
    if (existingPattern) continue;

    // Calculate confidence based on frequency and similarity
    const frequencyScore = Math.min(data.count / 5, 1); // Cap at 5 transactions
    const confidence = data.avgConfidence * 0.7 + frequencyScore * 0.3;

    if (confidence >= settings.minConfidence) {
      const topMerchants = data.merchants.slice(0, 2).join(', ');
      allSuggestions.push({
        categoryId,
        confidence,
        reason: 'similar_merchant',
        details: `Similar to ${topMerchants} (${data.count} transactions)`,
      });
    }
  }

  // 3. Check amount patterns (lower priority, supplementary)
  const amountPatterns = findAmountPatterns(amount, transactions, 0.15);
  for (const [categoryId, data] of amountPatterns.entries()) {
    // Only add if we don't already have a suggestion for this category
    const existing = allSuggestions.find((s) => s.categoryId === categoryId);
    if (existing) {
      // Boost existing suggestion confidence slightly
      existing.confidence = Math.min(1, existing.confidence + 0.05);
      continue;
    }

    // Amount patterns alone have lower confidence
    const frequencyScore = Math.min(data.count / 10, 1);
    const accuracyScore = 1 - data.avgDiff;
    const confidence = (frequencyScore * 0.5 + accuracyScore * 0.5) * 0.7;

    if (confidence >= settings.minConfidence) {
      allSuggestions.push({
        categoryId,
        confidence,
        reason: 'amount_pattern',
        details: `Similar amount appears ${data.count} times in this category`,
      });
    }
  }

  // Sort by confidence and filter by min confidence
  const filteredSuggestions = allSuggestions
    .filter((s) => s.confidence >= settings.minConfidence)
    .sort((a, b) => {
      // Exact matches first
      if (a.reason === 'exact_match' && b.reason !== 'exact_match') return -1;
      if (b.reason === 'exact_match' && a.reason !== 'exact_match') return 1;
      // Then by confidence
      return b.confidence - a.confidence;
    });

  // Deduplicate by category (keep highest confidence)
  const seen = new Set<CategoryId>();
  const deduplicated = filteredSuggestions.filter((suggestion) => {
    if (seen.has(suggestion.categoryId)) return false;
    seen.add(suggestion.categoryId);
    return true;
  });

  // Return top N suggestions
  return deduplicated.slice(0, settings.maxSuggestions);
}

/**
 * Batch generates suggestions for multiple transactions
 * Useful for bulk categorization or preview
 */
export function generateBulkSuggestions(
  transactions: Transaction[],
  allTransactions: Transaction[],
  learnedPatterns: LearnedPattern[],
  settings: SuggestionSettings
): Map<string, CategorySuggestion[]> {
  const results = new Map<string, CategorySuggestion[]>();

  for (const tx of transactions) {
    // Filter out the current transaction to avoid self-reference
    const historicalTransactions = allTransactions.filter((t) => t.id !== tx.id);

    const suggestions = generateSuggestions(
      tx.merchant,
      tx.amount,
      historicalTransactions,
      learnedPatterns,
      settings
    );

    if (suggestions.length > 0) {
      results.set(tx.id, suggestions);
    }
  }

  return results;
}

/**
 * Validates if a suggestion is still relevant given updated transaction history
 * Used to refresh suggestions after new categorizations
 */
export function validateSuggestion(
  suggestion: CategorySuggestion,
  merchant: string,
  amount: number,
  transactions: Transaction[],
  learnedPatterns: LearnedPattern[]
): boolean {
  // Re-generate suggestions and check if this one still appears
  const freshSuggestions = generateSuggestions(
    merchant,
    amount,
    transactions,
    learnedPatterns,
    {
      enableSuggestions: true,
      minConfidence: suggestion.confidence - 0.1, // Slightly lower threshold
      maxSuggestions: 10, // Check more to be sure
    }
  );

  return freshSuggestions.some(
    (s) => s.categoryId === suggestion.categoryId && s.confidence >= suggestion.confidence * 0.9
  );
}
