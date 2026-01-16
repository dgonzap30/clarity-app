import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, BudgetConfig, CustomCategorizationRule, CustomCategory, SuggestionSettings } from '@/types/settings';
import type { SubscriptionSettings } from '@/types/subscription';
import type { CategoryId } from '@/types';
import { isDefaultCategoryId } from '@/types';
import {
  loadSettings,
  saveSettings,
  addCustomRule,
  updateCustomRule,
  removeCustomRule,
  upsertLearnedPattern,
  removeLearnedPattern,
  trustLearnedPattern,
  addCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  updateDefaultCategory,
  deleteDefaultCategory,
  restoreDefaultCategory,
  resetDefaultCategory,
} from '@/lib/settings-storage';

export interface UseSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;

  // Direct settings update (for subscriptions and other complex updates)
  updateSettings: (settings: UserSettings) => void;

  // Budget operations
  setBudget: (categoryId: CategoryId, config: Partial<BudgetConfig>) => void;
  setTotalBudget: (amount: number | null) => void;
  setEnableTotalBudget: (enabled: boolean) => void;
  getBudget: (categoryId: CategoryId) => BudgetConfig;
  getTotalBudgetedAmount: () => number;

  // Custom rules operations
  addRule: (rule: Omit<CustomCategorizationRule, 'id' | 'createdAt' | 'matchCount'>) => void;
  updateRule: (ruleId: string, updates: Partial<Omit<CustomCategorizationRule, 'id' | 'createdAt'>>) => void;
  deleteRule: (ruleId: string) => void;

  // Learned patterns operations
  learnPattern: (merchantPattern: string, categoryId: CategoryId) => void;
  forgetPattern: (patternId: string) => void;
  trustPattern: (patternId: string) => void;

  // Category operations
  addCategory: (category: Omit<CustomCategory, 'id' | 'createdAt' | 'modifiedAt'>) => CategoryId;
  updateCategory: (categoryId: CategoryId, updates: Partial<Pick<CustomCategory, 'name' | 'color' | 'icon'>>) => void;
  deleteCategory: (categoryId: CategoryId) => void;
  restoreCategory: (categoryId: CategoryId) => void;
  resetCategoryToDefault: (categoryId: CategoryId) => void;

  // Preferences
  setPreference: <K extends keyof UserSettings['preferences']>(
    key: K,
    value: UserSettings['preferences'][K]
  ) => void;

  // Subscription settings
  updateSubscriptionSettings: (updates: Partial<SubscriptionSettings>) => void;

  // Suggestion settings
  updateSuggestionSettings: (updates: Partial<SuggestionSettings>) => void;

  // Reset
  resetToDefaults: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setIsLoading(false);
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveSettings(settings);
    }
  }, [settings, isLoading]);

  // Direct settings update (for subscriptions and other complex updates)
  const updateSettingsFn = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
  }, []);

  // Budget operations
  const setBudget = useCallback((categoryId: CategoryId, config: Partial<BudgetConfig>) => {
    setSettings((prev) => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [categoryId]: {
          ...prev.budgets[categoryId],
          ...config,
        },
      },
    }));
  }, []);

  const setTotalBudget = useCallback((amount: number | null) => {
    setSettings((prev) => ({
      ...prev,
      totalMonthlyBudget: amount,
    }));
  }, []);

  const setEnableTotalBudget = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enableTotalBudget: enabled,
    }));
  }, []);

  const getBudget = useCallback(
    (categoryId: CategoryId): BudgetConfig => {
      return settings.budgets[categoryId];
    },
    [settings.budgets]
  );

  const getTotalBudgetedAmount = useCallback((): number => {
    return Object.values(settings.budgets)
      .filter((b) => b.enabled)
      .reduce((sum, b) => sum + b.amount, 0);
  }, [settings.budgets]);

  // Custom rules operations
  const addRule = useCallback(
    (rule: Omit<CustomCategorizationRule, 'id' | 'createdAt' | 'matchCount'>) => {
      setSettings((prev) => addCustomRule(prev, rule));
    },
    []
  );

  const updateRuleFn = useCallback(
    (ruleId: string, updates: Partial<Omit<CustomCategorizationRule, 'id' | 'createdAt'>>) => {
      setSettings((prev) => updateCustomRule(prev, ruleId, updates));
    },
    []
  );

  const deleteRule = useCallback((ruleId: string) => {
    setSettings((prev) => removeCustomRule(prev, ruleId));
  }, []);

  // Learned patterns operations
  const learnPattern = useCallback((merchantPattern: string, categoryId: CategoryId) => {
    // Normalize the merchant pattern
    const normalized = merchantPattern.toUpperCase().trim();

    setSettings((prev) => {
      const existing = prev.learnedPatterns.find(
        (p) => p.merchantPattern === normalized
      );

      if (existing) {
        // If same category, increase confidence
        if (existing.categoryId === categoryId) {
          return {
            ...prev,
            learnedPatterns: prev.learnedPatterns.map((p) =>
              p.id === existing.id
                ? {
                    ...p,
                    confidence: Math.min(1, p.confidence + 0.1),
                    occurrences: p.occurrences + 1,
                    lastUsed: new Date().toISOString(),
                  }
                : p
            ),
          };
        }
        // Different category - if low occurrences, switch; otherwise reduce confidence
        if (existing.occurrences < 3) {
          return {
            ...prev,
            learnedPatterns: prev.learnedPatterns.map((p) =>
              p.id === existing.id
                ? {
                    ...p,
                    categoryId,
                    confidence: 0.5,
                    occurrences: p.occurrences + 1,
                    lastUsed: new Date().toISOString(),
                  }
                : p
            ),
          };
        }
        // Keep old but reduce confidence
        return {
          ...prev,
          learnedPatterns: prev.learnedPatterns.map((p) =>
            p.id === existing.id
              ? { ...p, confidence: p.confidence * 0.8 }
              : p
          ),
        };
      }

      // New pattern
      return upsertLearnedPattern(prev, {
        merchantPattern: normalized,
        categoryId,
        confidence: 0.6,
        occurrences: 1,
        lastUsed: new Date().toISOString(),
      });
    });
  }, []);

  const forgetPattern = useCallback((patternId: string) => {
    setSettings((prev) => removeLearnedPattern(prev, patternId));
  }, []);

  const trustPatternFn = useCallback((patternId: string) => {
    setSettings((prev) => trustLearnedPattern(prev, patternId));
  }, []);

  // Category operations
  const addCategoryFn = useCallback(
    (category: Omit<CustomCategory, 'id' | 'createdAt' | 'modifiedAt'>): CategoryId => {
      let newCategoryId: CategoryId = '';
      setSettings((prev) => {
        const result = addCustomCategory(prev, category);
        newCategoryId = result.categoryId;
        return result.settings;
      });
      return newCategoryId;
    },
    []
  );

  const updateCategoryFn = useCallback(
    (categoryId: CategoryId, updates: Partial<Pick<CustomCategory, 'name' | 'color' | 'icon'>>) => {
      setSettings((prev) => {
        // Check if it's a custom category
        const isCustom = prev.customCategories.some((c) => c.id === categoryId);
        if (isCustom) {
          return updateCustomCategory(prev, categoryId, updates);
        }
        // It's a default category
        return updateDefaultCategory(prev, categoryId, updates);
      });
    },
    []
  );

  const deleteCategoryFn = useCallback((categoryId: CategoryId) => {
    // Prevent deleting 'uncategorized'
    if (categoryId === 'uncategorized') return;

    setSettings((prev) => {
      // Check if it's a custom category
      const isCustom = prev.customCategories.some((c) => c.id === categoryId);
      if (isCustom) {
        return deleteCustomCategory(prev, categoryId);
      }
      // It's a default category - soft delete
      return deleteDefaultCategory(prev, categoryId);
    });
  }, []);

  const restoreCategoryFn = useCallback((categoryId: CategoryId) => {
    if (!isDefaultCategoryId(categoryId)) return;
    setSettings((prev) => restoreDefaultCategory(prev, categoryId));
  }, []);

  const resetCategoryToDefaultFn = useCallback((categoryId: CategoryId) => {
    if (!isDefaultCategoryId(categoryId)) return;
    setSettings((prev) => resetDefaultCategory(prev, categoryId));
  }, []);

  // Preferences
  const setPreference = useCallback(
    <K extends keyof UserSettings['preferences']>(
      key: K,
      value: UserSettings['preferences'][K]
    ) => {
      setSettings((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value,
        },
      }));
    },
    []
  );

  // Subscription settings
  const updateSubscriptionSettingsFn = useCallback(
    (updates: Partial<SubscriptionSettings>) => {
      setSettings((prev) => ({
        ...prev,
        subscriptions: {
          ...prev.subscriptions,
          ...updates,
        },
      }));
    },
    []
  );

  // Suggestion settings
  const updateSuggestionSettingsFn = useCallback(
    (updates: Partial<SuggestionSettings>) => {
      setSettings((prev) => ({
        ...prev,
        suggestionSettings: {
          ...prev.suggestionSettings,
          ...updates,
        },
      }));
    },
    []
  );

  // Reset
  const resetToDefaults = useCallback(() => {
    const defaults = loadSettings();
    setSettings(defaults);
  }, []);

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsFn,
    setBudget,
    setTotalBudget,
    setEnableTotalBudget,
    getBudget,
    getTotalBudgetedAmount,
    addRule,
    updateRule: updateRuleFn,
    deleteRule,
    learnPattern,
    forgetPattern,
    trustPattern: trustPatternFn,
    addCategory: addCategoryFn,
    updateCategory: updateCategoryFn,
    deleteCategory: deleteCategoryFn,
    restoreCategory: restoreCategoryFn,
    resetCategoryToDefault: resetCategoryToDefaultFn,
    setPreference,
    updateSubscriptionSettings: updateSubscriptionSettingsFn,
    updateSuggestionSettings: updateSuggestionSettingsFn,
    resetToDefaults,
  };
}
