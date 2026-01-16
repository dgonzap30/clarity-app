import { format } from 'date-fns';
import { CURRENCY, LOCALE, DATE_FORMAT } from './constants';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1000000) {
    return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 10000) {
    return `${sign}$${(abs / 1000).toFixed(1)}K`;
  }
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(2)}K`;
  }
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
