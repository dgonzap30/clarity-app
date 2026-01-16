import type { Category, DefaultCategoryId } from '@/types';

export const DEFAULT_CATEGORIES: Record<DefaultCategoryId, Category> = {
  'school-housing': {
    id: 'school-housing',
    name: 'School & Housing',
    color: '#F59E0B',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    icon: 'GraduationCap',
    hasBudget: false,
    isDefault: true,
  },
  'personal': {
    id: 'personal',
    name: 'Personal',
    color: '#3B82F6',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: 'User',
    hasBudget: true,
    monthlyBudget: 3000,
    isDefault: true,
  },
  'groceries-supplies': {
    id: 'groceries-supplies',
    name: 'Groceries & Supplies',
    color: '#22C55E',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    icon: 'ShoppingCart',
    hasBudget: true,
    monthlyBudget: 5000,
    isDefault: true,
  },
  'eating-out-delivery': {
    id: 'eating-out-delivery',
    name: 'Eating Out & Delivery',
    color: '#F97316',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: 'Utensils',
    hasBudget: true,
    monthlyBudget: 8000,
    isDefault: true,
  },
  'shopping-retail': {
    id: 'shopping-retail',
    name: 'Shopping & Retail',
    color: '#EC4899',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-700 dark:text-pink-300',
    icon: 'Shirt',
    hasBudget: true,
    monthlyBudget: 2000,
    isDefault: true,
  },
  'nightlife': {
    id: 'nightlife',
    name: 'Nightlife',
    color: '#EF4444',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
    icon: 'Wine',
    hasBudget: true,
    monthlyBudget: 12000,
    isDefault: true,
  },
  'transportation': {
    id: 'transportation',
    name: 'Transportation',
    color: '#06B6D4',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    icon: 'Car',
    hasBudget: false,
    isDefault: true,
  },
  'work-ai': {
    id: 'work-ai',
    name: 'Work & AI',
    color: '#8B5CF6',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    textColor: 'text-violet-700 dark:text-violet-300',
    icon: 'Briefcase',
    hasBudget: false,
    isDefault: true,
  },
  'health-sports': {
    id: 'health-sports',
    name: 'Health & Sports',
    color: '#22C55E',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    icon: 'Heart',
    hasBudget: false,
    isDefault: true,
  },
  'entertainment': {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#F97316',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: 'Film',
    hasBudget: true,
    monthlyBudget: 5000,
    isDefault: true,
  },
  'uncategorized': {
    id: 'uncategorized',
    name: 'Uncategorized',
    color: '#6B7280',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: 'HelpCircle',
    hasBudget: false,
    isDefault: true,
  },
};

// Backwards compatibility alias with string index
export const CATEGORIES: Record<string, Category> = DEFAULT_CATEGORIES;

export const TOTAL_MONTHLY_BUDGET = 35000; // MXN

export const CHART_COLORS = Object.values(CATEGORIES).map(c => c.color);

export const DATE_FORMAT = 'dd MMM yyyy';
export const CURRENCY = 'MXN';
export const LOCALE = 'es-MX';
