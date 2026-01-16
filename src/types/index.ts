// Default category IDs (built-in categories)
export const DEFAULT_CATEGORY_IDS = [
  'school-housing',
  'personal',
  'groceries-supplies',
  'eating-out-delivery',
  'shopping-retail',
  'nightlife',
  'transportation',
  'work-ai',
  'health-sports',
  'entertainment',
  'uncategorized',
] as const;

export type DefaultCategoryId = (typeof DEFAULT_CATEGORY_IDS)[number];

// CategoryId is now a string to support custom categories
export type CategoryId = string;

// Helper to check if an ID is a default category
export function isDefaultCategoryId(id: string): id is DefaultCategoryId {
  return DEFAULT_CATEGORY_IDS.includes(id as DefaultCategoryId);
}

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  hasBudget: boolean;
  monthlyBudget?: number;
  isDefault?: boolean;
  isDeleted?: boolean;
}

export interface RawTransaction {
  fecha: string;
  fechaCompra: string;
  descripcion: string;
  importe: number;
}

export interface Transaction extends RawTransaction {
  id: string;
  date: Date;
  purchaseDate: Date;
  category: Category;
  merchant: string;
  location: string;
  amount: number;
}

export interface BudgetStatus {
  categoryId: CategoryId;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'on-track' | 'warning' | 'over-budget';
}

export interface MonthlyBudget {
  month: string;
  budgets: BudgetStatus[];
  totalBudget: number;
  totalSpent: number;
}

export interface TransactionFilters {
  search: string;
  categories: CategoryId[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  merchants: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
}
