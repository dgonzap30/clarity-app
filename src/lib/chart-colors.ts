/**
 * Aurora Finance Chart Colors
 * Centralized color definitions for all charts to ensure consistency
 */

// CSS variable-based colors for Tailwind usage
export const chartColors = {
  primary: 'hsl(var(--aurora-teal))',
  secondary: 'hsl(var(--aurora-blue))',
  tertiary: 'hsl(var(--aurora-purple))',
  income: 'hsl(var(--aurora-income))',
  expense: 'hsl(var(--aurora-expense))',
  neutral: 'hsl(var(--aurora-neutral))',
} as const;

// Hex values for libraries that require them (e.g., Recharts)
export const chartColorsHex = {
  primary: '#06D6A0',
  secondary: '#118AB2',
  tertiary: '#7B2CBF',
  income: '#06D6A0',
  expense: '#EF476F',
  neutral: '#FFD166',
  // Gradient stops
  gradientStart: '#06D6A0',
  gradientEnd: '#118AB2',
} as const;

// Chart gradient definitions for Recharts
export const chartGradients = {
  aurora: {
    id: 'auroraGradient',
    stops: [
      { offset: '5%', color: '#06D6A0', opacity: 0.3 },
      { offset: '95%', color: '#06D6A0', opacity: 0 },
    ],
  },
  income: {
    id: 'incomeGradient',
    stops: [
      { offset: '5%', color: '#06D6A0', opacity: 0.3 },
      { offset: '95%', color: '#06D6A0', opacity: 0 },
    ],
  },
  expense: {
    id: 'expenseGradient',
    stops: [
      { offset: '5%', color: '#EF476F', opacity: 0.3 },
      { offset: '95%', color: '#EF476F', opacity: 0 },
    ],
  },
} as const;
