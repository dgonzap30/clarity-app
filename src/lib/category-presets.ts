/**
 * Preset color palette for categories
 * Each color includes hex value and Tailwind classes for light/dark mode
 */
export const PRESET_COLORS = [
  { name: 'Red', hex: '#EF4444', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  { name: 'Orange', hex: '#F97316', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  { name: 'Amber', hex: '#F59E0B', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  { name: 'Yellow', hex: '#EAB308', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  { name: 'Lime', hex: '#84CC16', bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-300' },
  { name: 'Green', hex: '#22C55E', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  { name: 'Teal', hex: '#14B8A6', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  { name: 'Cyan', hex: '#06B6D4', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
  { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  { name: 'Violet', hex: '#8B5CF6', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  { name: 'Pink', hex: '#EC4899', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300' },
  { name: 'Gray', hex: '#6B7280', bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300' },
] as const;

export type PresetColor = (typeof PRESET_COLORS)[number];

/**
 * Find color preset by hex value
 */
export function getColorPreset(hex: string): PresetColor {
  return PRESET_COLORS.find((c) => c.hex === hex) || PRESET_COLORS[8]; // Default to blue
}

/**
 * Curated icons for spending categories
 * These are the icon names from lucide-react
 */
export const CATEGORY_ICONS = [
  // Original icons from defaults
  'GraduationCap',
  'User',
  'Wine',
  'Car',
  'Briefcase',
  'Heart',
  'Film',
  'HelpCircle',
  // Additional spending-relevant icons
  'Home',
  'ShoppingCart',
  'Utensils',
  'Coffee',
  'Plane',
  'Gift',
  'Gamepad2',
  'Music',
  'Book',
  'Dumbbell',
  'Shirt',
  'Smartphone',
  'Wrench',
  'Baby',
  'PiggyBank',
  'CreditCard',
  'Receipt',
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

/**
 * Check if a string is a valid category icon
 */
export function isValidCategoryIcon(icon: string): icon is CategoryIconName {
  return CATEGORY_ICONS.includes(icon as CategoryIconName);
}
