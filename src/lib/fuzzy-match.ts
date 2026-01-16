/**
 * Fuzzy matching utilities for intelligent merchant name matching
 * Uses Levenshtein distance and token-based similarity
 */

/**
 * Calculates the Levenshtein distance between two strings
 * (minimum number of single-character edits required to change one string into another)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[len1][len2];
}

/**
 * Calculates similarity score between two strings (0-1, where 1 is identical)
 * Based on Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Normalizes a merchant name for comparison
 * - Converts to lowercase
 * - Removes common suffixes/prefixes
 * - Removes special characters
 * - Trims whitespace
 */
export function normalizeMerchantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common payment processor IDs
    .replace(/\*+\d+$/, '')
    .replace(/\s+\d{4,}$/, '')
    // Remove common suffixes
    .replace(/\s+(inc|llc|ltd|corp|corporation|company|co)\b\.?$/i, '')
    // Remove special characters but keep spaces
    .replace(/[^\w\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes a string into words
 */
export function tokenize(str: string): string[] {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Calculates token-based similarity (Jaccard index)
 * Measures overlap between word sets
 */
export function tokenSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));

  if (tokens1.size === 0 && tokens2.size === 0) return 1;
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  // Calculate intersection
  const intersection = new Set([...tokens1].filter((token) => tokens2.has(token)));

  // Calculate union
  const union = new Set([...tokens1, ...tokens2]);

  // Jaccard index
  return intersection.size / union.size;
}

/**
 * Fuzzy matches a search string against a target string
 * Returns a confidence score (0-1) combining multiple metrics
 */
export function fuzzyMatch(search: string, target: string, options?: {
  normalizeFirst?: boolean;
  levenshteinWeight?: number;
  tokenWeight?: number;
  exactMatchBonus?: number;
}): number {
  const {
    normalizeFirst = true,
    levenshteinWeight = 0.5,
    tokenWeight = 0.5,
    exactMatchBonus = 0.2,
  } = options || {};

  // Normalize if requested
  const searchStr = normalizeFirst ? normalizeMerchantName(search) : search.toLowerCase();
  const targetStr = normalizeFirst ? normalizeMerchantName(target) : target.toLowerCase();

  // Check for exact match
  if (searchStr === targetStr) {
    return 1;
  }

  // Check if one contains the other (partial match)
  if (targetStr.includes(searchStr) || searchStr.includes(targetStr)) {
    const baseScore = 0.8;
    const lengthPenalty = Math.abs(searchStr.length - targetStr.length) / Math.max(searchStr.length, targetStr.length);
    return Math.min(1, baseScore + exactMatchBonus - lengthPenalty * 0.2);
  }

  // Calculate Levenshtein-based similarity
  const levenshteinScore = calculateSimilarity(searchStr, targetStr);

  // Calculate token-based similarity
  const tokenScore = tokenSimilarity(searchStr, targetStr);

  // Combine scores with weights
  const combinedScore = (levenshteinScore * levenshteinWeight) + (tokenScore * tokenWeight);

  return Math.min(1, combinedScore);
}

/**
 * Finds the best fuzzy matches from a list of candidates
 * Returns matches sorted by confidence score
 */
export function findBestMatches(
  search: string,
  candidates: string[],
  options?: {
    minConfidence?: number;
    maxResults?: number;
    normalizeFirst?: boolean;
  }
): Array<{ value: string; confidence: number }> {
  const { minConfidence = 0.6, maxResults = 5, normalizeFirst = true } = options || {};

  const matches = candidates
    .map((candidate) => ({
      value: candidate,
      confidence: fuzzyMatch(search, candidate, { normalizeFirst }),
    }))
    .filter((match) => match.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence);

  return matches.slice(0, maxResults);
}

/**
 * Checks if a pattern matches using fuzzy logic
 * Used for enhanced categorization rules
 */
export function fuzzyPatternMatch(
  text: string,
  pattern: string,
  minConfidence = 0.75
): boolean {
  return fuzzyMatch(pattern, text, { normalizeFirst: true }) >= minConfidence;
}
