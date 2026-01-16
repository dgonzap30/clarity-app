import { useMemo } from 'react';
import { resolveCategories } from '@/lib/categories';
import type { UserSettings } from '@/types/settings';
import type { Category, CategoryId } from '@/types';

export interface UseCategoriesReturn {
  /** All active categories as a record */
  categories: Record<string, Category>;
  /** All active categories as an array */
  categoryList: Category[];
  /** All active category IDs */
  categoryIds: CategoryId[];
  /** Get a specific category by ID */
  getCategory: (id: CategoryId) => Category | undefined;
  /** Check if an ID is a valid category */
  isValidId: (id: string) => boolean;
}

/**
 * Hook to access resolved categories (defaults + custom + overrides)
 */
export function useCategories(settings: UserSettings): UseCategoriesReturn {
  const categories = useMemo(() => resolveCategories(settings), [settings]);

  const categoryList = useMemo(() => Object.values(categories), [categories]);

  const categoryIds = useMemo(() => Object.keys(categories), [categories]);

  const getCategory = useMemo(
    () => (id: CategoryId) => categories[id],
    [categories]
  );

  const isValidId = useMemo(
    () => (id: string) => id in categories,
    [categories]
  );

  return {
    categories,
    categoryList,
    categoryIds,
    getCategory,
    isValidId,
  };
}
