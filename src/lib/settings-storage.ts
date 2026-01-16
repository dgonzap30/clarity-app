import type {
  UserSettings,
  CustomCategorizationRule,
  LearnedPattern,
  CustomCategory,
  CategoryOverride,
} from '@/types/settings';
import { DEFAULT_SETTINGS, DEFAULT_SUGGESTION_SETTINGS } from '@/types/settings';
import { DEFAULT_SUBSCRIPTION_SETTINGS } from '@/types/subscription';
import type { CategoryId } from '@/types';

const SETTINGS_KEY = 'spending-dashboard-settings';
const CURRENT_VERSION = 5;

/**
 * Migrates settings from older versions to current version
 */
function migrateSettings(settings: Partial<UserSettings>): UserSettings {
  let migrated = { ...settings };

  // Migration from v1 to v2: Add category management fields
  if (!settings.version || settings.version < 2) {
    migrated = {
      ...migrated,
      customCategories: [],
      categoryOverrides: [],
    };
  }

  // Migration from v2 to v3: Add subscription settings
  if (!settings.version || settings.version < 3) {
    migrated = {
      ...migrated,
      subscriptions: DEFAULT_SUBSCRIPTION_SETTINGS,
    };
  }

  // Migration from v3 to v4: Add personalization preferences
  if (!settings.version || settings.version < 4) {
    const existingPrefs = migrated.preferences || {
      confirmDestructiveActions: true,
      defaultUploadMode: 'merge' as const,
      enablePatternLearning: true,
    };
    migrated = {
      ...migrated,
      preferences: {
        ...existingPrefs,
        userName: undefined,
        enableGreetings: true,
        enableFunMessages: true,
      },
    };
  }

  // Migration from v4 to v5: Add split rules and suggestion settings
  if (!settings.version || settings.version < 5) {
    migrated = {
      ...migrated,
      splitRules: [],
      suggestionSettings: DEFAULT_SUGGESTION_SETTINGS,
    };
  }

  // Start with defaults and merge saved settings
  const result: UserSettings = {
    ...DEFAULT_SETTINGS,
    ...migrated,
    budgets: {
      ...DEFAULT_SETTINGS.budgets,
      ...(migrated.budgets || {}),
    },
    preferences: {
      ...DEFAULT_SETTINGS.preferences,
      ...(migrated.preferences || {}),
    },
    subscriptions: {
      ...DEFAULT_SUBSCRIPTION_SETTINGS,
      ...(migrated.subscriptions || {}),
    },
    suggestionSettings: {
      ...DEFAULT_SUGGESTION_SETTINGS,
      ...(migrated.suggestionSettings || {}),
    },
    customCategories: migrated.customCategories || [],
    categoryOverrides: migrated.categoryOverrides || [],
    splitRules: migrated.splitRules || [],
  };

  // Ensure version is current
  result.version = CURRENT_VERSION;

  return result;
}

/**
 * Saves user settings to localStorage
 */
export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

/**
 * Loads user settings from localStorage
 * Returns default settings if none exist or if parsing fails
 */
export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(data);
    return migrateSettings(parsed);
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Clears all settings from localStorage
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear settings from localStorage:', error);
  }
}

/**
 * Updates a specific setting
 */
export function updateSettings(
  current: UserSettings,
  updates: Partial<UserSettings>
): UserSettings {
  return {
    ...current,
    ...updates,
    budgets: {
      ...current.budgets,
      ...(updates.budgets || {}),
    },
    preferences: {
      ...current.preferences,
      ...(updates.preferences || {}),
    },
  };
}

/**
 * Adds a new custom categorization rule
 */
export function addCustomRule(
  settings: UserSettings,
  rule: Omit<CustomCategorizationRule, 'id' | 'createdAt' | 'matchCount'>
): UserSettings {
  const newRule: CustomCategorizationRule = {
    ...rule,
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    matchCount: 0,
  };

  return {
    ...settings,
    customRules: [...settings.customRules, newRule],
  };
}

/**
 * Updates an existing custom rule
 */
export function updateCustomRule(
  settings: UserSettings,
  ruleId: string,
  updates: Partial<Omit<CustomCategorizationRule, 'id' | 'createdAt'>>
): UserSettings {
  return {
    ...settings,
    customRules: settings.customRules.map((rule) =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ),
  };
}

/**
 * Removes a custom rule
 */
export function removeCustomRule(
  settings: UserSettings,
  ruleId: string
): UserSettings {
  return {
    ...settings,
    customRules: settings.customRules.filter((rule) => rule.id !== ruleId),
  };
}

/**
 * Adds or updates a learned pattern
 */
export function upsertLearnedPattern(
  settings: UserSettings,
  pattern: Omit<LearnedPattern, 'id'>
): UserSettings {
  const existing = settings.learnedPatterns.find(
    (p) => p.merchantPattern === pattern.merchantPattern
  );

  if (existing) {
    // Update existing pattern
    return {
      ...settings,
      learnedPatterns: settings.learnedPatterns.map((p) =>
        p.id === existing.id
          ? {
              ...p,
              ...pattern,
              occurrences: p.occurrences + 1,
              lastUsed: new Date().toISOString(),
            }
          : p
      ),
    };
  }

  // Add new pattern
  const newPattern: LearnedPattern = {
    ...pattern,
    id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  return {
    ...settings,
    learnedPatterns: [...settings.learnedPatterns, newPattern],
  };
}

/**
 * Removes a learned pattern
 */
export function removeLearnedPattern(
  settings: UserSettings,
  patternId: string
): UserSettings {
  return {
    ...settings,
    learnedPatterns: settings.learnedPatterns.filter((p) => p.id !== patternId),
  };
}

/**
 * Increases confidence for a learned pattern (when user "trusts" it)
 */
export function trustLearnedPattern(
  settings: UserSettings,
  patternId: string
): UserSettings {
  return {
    ...settings,
    learnedPatterns: settings.learnedPatterns.map((p) =>
      p.id === patternId
        ? { ...p, confidence: Math.min(1, p.confidence + 0.2) }
        : p
    ),
  };
}

// ============================================================================
// Category Management Operations
// ============================================================================

/**
 * Generates a unique ID for custom categories
 */
function generateCategoryId(): CategoryId {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Adds a new custom category
 */
export function addCustomCategory(
  settings: UserSettings,
  category: Omit<CustomCategory, 'id' | 'createdAt' | 'modifiedAt'>
): { settings: UserSettings; categoryId: CategoryId } {
  const id = generateCategoryId();
  const now = new Date().toISOString();

  const newCategory: CustomCategory = {
    ...category,
    id,
    createdAt: now,
    modifiedAt: now,
  };

  return {
    settings: {
      ...settings,
      customCategories: [...settings.customCategories, newCategory],
      // Initialize budget config for new category
      budgets: {
        ...settings.budgets,
        [id]: { enabled: false, amount: 0 },
      },
    },
    categoryId: id,
  };
}

/**
 * Updates an existing custom category
 */
export function updateCustomCategory(
  settings: UserSettings,
  categoryId: CategoryId,
  updates: Partial<Pick<CustomCategory, 'name' | 'color' | 'icon'>>
): UserSettings {
  return {
    ...settings,
    customCategories: settings.customCategories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, ...updates, modifiedAt: new Date().toISOString() }
        : cat
    ),
  };
}

/**
 * Deletes a custom category (hard delete)
 * Re-assigns rules and patterns to 'uncategorized'
 */
export function deleteCustomCategory(
  settings: UserSettings,
  categoryId: CategoryId
): UserSettings {
  // Remove budget config
  const { [categoryId]: _, ...remainingBudgets } = settings.budgets;

  return {
    ...settings,
    customCategories: settings.customCategories.filter((c) => c.id !== categoryId),
    budgets: remainingBudgets,
    // Re-assign rules and patterns to uncategorized
    customRules: settings.customRules.map((r) =>
      r.categoryId === categoryId ? { ...r, categoryId: 'uncategorized' } : r
    ),
    learnedPatterns: settings.learnedPatterns.map((p) =>
      p.categoryId === categoryId ? { ...p, categoryId: 'uncategorized' } : p
    ),
  };
}

/**
 * Updates a default category (creates or updates an override)
 */
export function updateDefaultCategory(
  settings: UserSettings,
  categoryId: CategoryId,
  updates: Partial<Pick<CategoryOverride, 'name' | 'color' | 'icon'>>
): UserSettings {
  const existingOverride = settings.categoryOverrides.find((o) => o.id === categoryId);
  const now = new Date().toISOString();

  if (existingOverride) {
    // Update existing override
    return {
      ...settings,
      categoryOverrides: settings.categoryOverrides.map((o) =>
        o.id === categoryId ? { ...o, ...updates, modifiedAt: now } : o
      ),
    };
  }

  // Create new override
  const newOverride: CategoryOverride = {
    id: categoryId,
    ...updates,
    modifiedAt: now,
  };

  return {
    ...settings,
    categoryOverrides: [...settings.categoryOverrides, newOverride],
  };
}

/**
 * Soft-deletes a default category
 * Re-assigns rules and patterns to 'uncategorized'
 */
export function deleteDefaultCategory(
  settings: UserSettings,
  categoryId: CategoryId
): UserSettings {
  const existingOverride = settings.categoryOverrides.find((o) => o.id === categoryId);
  const now = new Date().toISOString();

  const deleteOverride: CategoryOverride = {
    ...(existingOverride || { id: categoryId }),
    isDeleted: true,
    modifiedAt: now,
  };

  return {
    ...settings,
    categoryOverrides: existingOverride
      ? settings.categoryOverrides.map((o) => (o.id === categoryId ? deleteOverride : o))
      : [...settings.categoryOverrides, deleteOverride],
    // Re-assign rules and patterns to uncategorized
    customRules: settings.customRules.map((r) =>
      r.categoryId === categoryId ? { ...r, categoryId: 'uncategorized' } : r
    ),
    learnedPatterns: settings.learnedPatterns.map((p) =>
      p.categoryId === categoryId ? { ...p, categoryId: 'uncategorized' } : p
    ),
  };
}

/**
 * Restores a soft-deleted default category
 */
export function restoreDefaultCategory(
  settings: UserSettings,
  categoryId: CategoryId
): UserSettings {
  return {
    ...settings,
    categoryOverrides: settings.categoryOverrides.map((o) =>
      o.id === categoryId ? { ...o, isDeleted: false, modifiedAt: new Date().toISOString() } : o
    ),
  };
}

/**
 * Resets a default category to its original values (removes override)
 */
export function resetDefaultCategory(
  settings: UserSettings,
  categoryId: CategoryId
): UserSettings {
  return {
    ...settings,
    categoryOverrides: settings.categoryOverrides.filter((o) => o.id !== categoryId),
  };
}
