import { DEFAULT_CATEGORIES } from './constants';
import { getColorPreset } from './category-presets';
import type { Category, CategoryId } from '@/types';
import type { UserSettings } from '@/types/settings';

/**
 * Resolves all active categories by merging:
 * 1. Default categories (with overrides applied)
 * 2. Custom user-created categories
 * Excludes soft-deleted defaults
 */
export function resolveCategories(settings: UserSettings): Record<string, Category> {
  const result: Record<string, Category> = {};

  // 1. Process default categories with overrides
  for (const [id, defaultCat] of Object.entries(DEFAULT_CATEGORIES)) {
    const override = settings.categoryOverrides?.find((o) => o.id === id);

    // Skip if soft-deleted
    if (override?.isDeleted) continue;

    // Apply overrides if present
    if (override) {
      const colorPreset = override.color ? getColorPreset(override.color) : null;
      result[id] = {
        ...defaultCat,
        ...(override.name && { name: override.name }),
        ...(override.color && {
          color: override.color,
          bgColor: colorPreset?.bg || defaultCat.bgColor,
          textColor: colorPreset?.text || defaultCat.textColor,
        }),
        ...(override.icon && { icon: override.icon }),
      };
    } else {
      result[id] = { ...defaultCat };
    }
  }

  // 2. Add custom categories
  if (settings.customCategories) {
    for (const custom of settings.customCategories) {
      const colorPreset = getColorPreset(custom.color);
      result[custom.id] = {
        id: custom.id,
        name: custom.name,
        color: custom.color,
        bgColor: colorPreset.bg,
        textColor: colorPreset.text,
        icon: custom.icon,
        hasBudget: false,
        isDefault: false,
      };
    }
  }

  return result;
}

/**
 * Get a single category by ID
 */
export function getCategory(id: CategoryId, settings: UserSettings): Category | undefined {
  const categories = resolveCategories(settings);
  return categories[id];
}

/**
 * Get all category IDs (for iteration)
 */
export function getAllCategoryIds(settings: UserSettings): CategoryId[] {
  return Object.keys(resolveCategories(settings));
}

/**
 * Check if a category ID is valid (exists and not deleted)
 */
export function isValidCategoryId(id: string, settings: UserSettings): boolean {
  const categories = resolveCategories(settings);
  return id in categories;
}

/**
 * Get the fallback category (uncategorized)
 */
export function getFallbackCategory(settings: UserSettings): Category {
  const categories = resolveCategories(settings);
  return categories['uncategorized'] || DEFAULT_CATEGORIES['uncategorized'];
}

/**
 * Get category, falling back to 'uncategorized' if not found
 */
export function getCategoryOrFallback(id: CategoryId, settings: UserSettings): Category {
  return getCategory(id, settings) || getFallbackCategory(settings);
}
