/**
 * Clarity Finance Chart Colors
 * Sophisticated gradient-based color system for charts
 */

// CSS variable-based colors for Tailwind usage
export const chartColors = {
  // Gradient-based colors matching the design system
  primary: 'hsl(var(--gradient-blue-from))',
  secondary: 'hsl(var(--gradient-teal-from))',
  tertiary: 'hsl(var(--gradient-purple-from))',
  income: 'hsl(var(--gradient-teal-from))',
  expense: 'hsl(var(--gradient-red-from))',
  neutral: 'hsl(var(--gradient-amber-from))',
} as const;

// Hex values for libraries that require them (e.g., Recharts)
export const chartColorsHex = {
  // Blue gradient
  primary: '#3B82F6',
  primaryGlow: '#60A5FA',
  // Teal gradient
  secondary: '#06D6A0',
  secondaryGlow: '#14F4C3',
  income: '#06D6A0',
  incomeGlow: '#14F4C3',
  // Purple gradient
  tertiary: '#8B5CF6',
  tertiaryGlow: '#A78BFA',
  // Red gradient
  expense: '#EF4444',
  expenseGlow: '#F87171',
  // Amber gradient
  neutral: '#F59E0B',
  neutralGlow: '#FCD34D',
  // Legacy compatibility
  gradientStart: '#06D6A0',
  gradientEnd: '#14F4C3',
} as const;

// Chart gradient definitions for Recharts with sophisticated gradients
export const chartGradients = {
  blue: {
    id: 'blueGradient',
    stops: [
      { offset: '0%', color: '#60A5FA', opacity: 0.8 },
      { offset: '100%', color: '#3B82F6', opacity: 0.1 },
    ],
  },
  teal: {
    id: 'tealGradient',
    stops: [
      { offset: '0%', color: '#14F4C3', opacity: 0.8 },
      { offset: '100%', color: '#06D6A0', opacity: 0.1 },
    ],
  },
  income: {
    id: 'incomeGradient',
    stops: [
      { offset: '0%', color: '#14F4C3', opacity: 0.8 },
      { offset: '100%', color: '#06D6A0', opacity: 0.1 },
    ],
  },
  purple: {
    id: 'purpleGradient',
    stops: [
      { offset: '0%', color: '#A78BFA', opacity: 0.8 },
      { offset: '100%', color: '#8B5CF6', opacity: 0.1 },
    ],
  },
  expense: {
    id: 'expenseGradient',
    stops: [
      { offset: '0%', color: '#F87171', opacity: 0.8 },
      { offset: '100%', color: '#EF4444', opacity: 0.1 },
    ],
  },
  amber: {
    id: 'amberGradient',
    stops: [
      { offset: '0%', color: '#FCD34D', opacity: 0.8 },
      { offset: '100%', color: '#F59E0B', opacity: 0.1 },
    ],
  },
  // Legacy aurora gradient now uses teal
  aurora: {
    id: 'auroraGradient',
    stops: [
      { offset: '0%', color: '#14F4C3', opacity: 0.8 },
      { offset: '100%', color: '#06D6A0', opacity: 0.1 },
    ],
  },
} as const;
