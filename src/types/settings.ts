import type { CategoryId } from './index';
import type { SubscriptionSettings } from './subscription';
import { DEFAULT_SUBSCRIPTION_SETTINGS } from './subscription';

/**
 * Budget configuration for a single category
 */
export interface BudgetConfig {
  enabled: boolean;
  amount: number;
}

/**
 * Custom categorization rule created by the user
 */
export interface CustomCategorizationRule {
  id: string;
  pattern: string;
  isRegex: boolean;
  categoryId: CategoryId;
  priority: number;
  createdAt: string;
  matchCount: number;
  // Enhanced matching options (optional for backward compatibility)
  matchType?: 'contains' | 'startsWith' | 'endsWith' | 'exact' | 'fuzzy';
  caseSensitive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  excludePatterns?: string[];
}

/**
 * Condition for split categorization rules
 */
export interface SplitRuleCondition {
  type: 'amount' | 'time' | 'dayOfWeek' | 'description';
  operator: 'gt' | 'lt' | 'eq' | 'between' | 'contains';
  value: string | number;
  valueEnd?: number; // For 'between' operator
}

/**
 * Split categorization rule - same merchant, different categories based on context
 */
export interface SplitCategorizationRule {
  id: string;
  merchantPattern: string;
  isRegex: boolean;
  defaultCategoryId: CategoryId;
  conditions: Array<{
    condition: SplitRuleCondition;
    categoryId: CategoryId;
    label?: string; // e.g., "Work", "Personal"
  }>;
  createdAt: string;
  matchCount: number;
}

/**
 * Suggestion settings for category suggestions
 */
export interface SuggestionSettings {
  enableSuggestions: boolean;
  minConfidence: number; // 0-1, minimum confidence for showing suggestions
  maxSuggestions: number; // Max suggestions to show (default: 3)
}

/**
 * Learned pattern from user recategorizations
 */
export interface LearnedPattern {
  id: string;
  merchantPattern: string;
  categoryId: CategoryId;
  confidence: number;
  occurrences: number;
  lastUsed: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  confirmDestructiveActions: boolean;
  defaultUploadMode: 'merge' | 'replace';
  enablePatternLearning: boolean;
  // Personalization settings
  userName?: string;
  enableGreetings?: boolean;
  enableFunMessages?: boolean;
}

/**
 * Custom category created by user
 */
export interface CustomCategory {
  id: CategoryId;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  modifiedAt: string;
}

/**
 * Override for a default category (edit or soft-delete)
 */
export interface CategoryOverride {
  id: CategoryId;
  name?: string;
  color?: string;
  icon?: string;
  isDeleted?: boolean;
  modifiedAt: string;
}

/**
 * Complete user settings
 */
export interface UserSettings {
  version: number;
  budgets: Record<string, BudgetConfig>;
  totalMonthlyBudget: number | null;
  enableTotalBudget: boolean;
  customRules: CustomCategorizationRule[];
  learnedPatterns: LearnedPattern[];
  splitRules: SplitCategorizationRule[];
  suggestionSettings: SuggestionSettings;
  preferences: UserPreferences;
  customCategories: CustomCategory[];
  categoryOverrides: CategoryOverride[];
  subscriptions: SubscriptionSettings;
}

/**
 * Default budget configuration based on original hardcoded values
 */
export const DEFAULT_BUDGETS: Record<CategoryId, BudgetConfig> = {
  'school-housing': { enabled: false, amount: 0 },
  'personal': { enabled: true, amount: 18000 },
  'nightlife': { enabled: true, amount: 12000 },
  'transportation': { enabled: false, amount: 0 },
  'work-ai': { enabled: false, amount: 0 },
  'health-sports': { enabled: false, amount: 0 },
  'entertainment': { enabled: true, amount: 5000 },
  'uncategorized': { enabled: false, amount: 0 },
};

/**
 * Default suggestion settings
 */
export const DEFAULT_SUGGESTION_SETTINGS: SuggestionSettings = {
  enableSuggestions: true,
  minConfidence: 0.7,
  maxSuggestions: 3,
};

/**
 * Default user settings
 */
export const DEFAULT_SETTINGS: UserSettings = {
  version: 5,
  budgets: DEFAULT_BUDGETS,
  totalMonthlyBudget: 35000,
  enableTotalBudget: true,
  customRules: [],
  learnedPatterns: [],
  splitRules: [],
  suggestionSettings: DEFAULT_SUGGESTION_SETTINGS,
  preferences: {
    confirmDestructiveActions: true,
    defaultUploadMode: 'merge',
    enablePatternLearning: true,
    userName: 'Diego',
    enableGreetings: true,
    enableFunMessages: true,
  },
  customCategories: [],
  categoryOverrides: [],
  subscriptions: DEFAULT_SUBSCRIPTION_SETTINGS,
};
