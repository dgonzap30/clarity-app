import type { Transaction, Category } from '@/types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from 'date-fns';

/**
 * Merchant data for rankings
 */
export interface MerchantData {
  merchant: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  category: Category | null;
  lastTransaction: Date;
  percentOfTotal: number;
}

/**
 * Monthly spending data
 */
export interface MonthlyData {
  month: string;
  monthDate: Date;
  total: number;
  count: number;
  categories: Record<string, number>;
}

/**
 * Yearly spending data
 */
export interface YearlyData {
  year: number;
  total: number;
  monthlyAverage: number;
  monthCount: number;
}

/**
 * Peak period data
 */
export interface PeakPeriod {
  month: { month: string; amount: number; percentAboveAverage: number } | null;
  lowestMonth: { month: string; amount: number } | null;
  day: { date: Date; amount: number; transactionCount: number } | null;
}

/**
 * Group transactions by month
 */
export function groupByMonth(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    const key = format(t.date, 'yyyy-MM');
    const existing = groups.get(key) || [];
    existing.push(t);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Group transactions by year
 */
export function groupByYear(transactions: Transaction[]): Map<number, Transaction[]> {
  const groups = new Map<number, Transaction[]>();

  for (const t of transactions) {
    const year = t.date.getFullYear();
    const existing = groups.get(year) || [];
    existing.push(t);
    groups.set(year, existing);
  }

  return groups;
}

/**
 * Group transactions by day
 */
export function groupByDay(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    const key = format(t.date, 'yyyy-MM-dd');
    const existing = groups.get(key) || [];
    existing.push(t);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(values: number[], window: number): number[] {
  if (values.length < window) return values;

  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      // Not enough data points yet, use partial average
      const slice = values.slice(0, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    } else {
      const slice = values.slice(i - window + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / window);
    }
  }
  return result;
}

/**
 * Aggregate merchants from transactions
 */
export function aggregateMerchants(
  transactions: Transaction[],
  categories?: Record<string, Category>
): MerchantData[] {
  const merchantMap = new Map<
    string,
    {
      total: number;
      count: number;
      lastDate: Date;
      category: Category | null;
    }
  >();

  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  for (const t of transactions) {
    const existing = merchantMap.get(t.merchant);
    if (existing) {
      existing.total += t.amount;
      existing.count += 1;
      if (t.date > existing.lastDate) {
        existing.lastDate = t.date;
        existing.category = categories?.[t.category.id] || t.category;
      }
    } else {
      merchantMap.set(t.merchant, {
        total: t.amount,
        count: 1,
        lastDate: t.date,
        category: categories?.[t.category.id] || t.category,
      });
    }
  }

  const merchants: MerchantData[] = [];
  for (const [merchant, data] of merchantMap) {
    merchants.push({
      merchant,
      totalSpent: data.total,
      transactionCount: data.count,
      averageTransaction: data.total / data.count,
      category: data.category,
      lastTransaction: data.lastDate,
      percentOfTotal: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
    });
  }

  // Sort by total spent descending
  return merchants.sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Calculate monthly data for all transactions
 */
export function calculateMonthlyData(transactions: Transaction[]): MonthlyData[] {
  if (transactions.length === 0) return [];

  const byMonth = groupByMonth(transactions);
  const result: MonthlyData[] = [];

  // Sort keys chronologically
  const sortedKeys = Array.from(byMonth.keys()).sort();

  for (const key of sortedKeys) {
    const txns = byMonth.get(key) || [];
    const total = txns.reduce((sum, t) => sum + t.amount, 0);

    // Calculate category breakdown
    const categories: Record<string, number> = {};
    for (const t of txns) {
      categories[t.category.id] = (categories[t.category.id] || 0) + t.amount;
    }

    result.push({
      month: format(new Date(key + '-01'), 'MMM yyyy'),
      monthDate: new Date(key + '-01'),
      total,
      count: txns.length,
      categories,
    });
  }

  return result;
}

/**
 * Calculate yearly data for all transactions
 */
export function calculateYearlyData(transactions: Transaction[]): YearlyData[] {
  if (transactions.length === 0) return [];

  const byYear = groupByYear(transactions);
  const result: YearlyData[] = [];

  // Sort years chronologically
  const sortedYears = Array.from(byYear.keys()).sort();

  for (const year of sortedYears) {
    const txns = byYear.get(year) || [];
    const total = txns.reduce((sum, t) => sum + t.amount, 0);

    // Count unique months in this year
    const uniqueMonths = new Set(txns.map((t) => t.date.getMonth()));
    const monthCount = uniqueMonths.size;

    result.push({
      year,
      total,
      monthlyAverage: monthCount > 0 ? total / monthCount : total,
      monthCount,
    });
  }

  return result;
}

/**
 * Calculate category evolution data for stacked charts
 */
export function calculateCategoryEvolution(
  transactions: Transaction[],
  categoryList: Category[]
): Array<{ month: string; [categoryId: string]: number | string }> {
  if (transactions.length === 0) return [];

  const monthlyData = calculateMonthlyData(transactions);
  const categoryIds = categoryList.map((c) => c.id);

  return monthlyData.map((m) => {
    const row: { month: string; [categoryId: string]: number | string } = {
      month: m.month,
    };
    for (const catId of categoryIds) {
      row[catId] = m.categories[catId] || 0;
    }
    return row;
  });
}

/**
 * Find peak spending periods
 */
export function findPeakPeriods(transactions: Transaction[]): PeakPeriod {
  if (transactions.length === 0) {
    return { month: null, lowestMonth: null, day: null };
  }

  const monthlyData = calculateMonthlyData(transactions);
  const avgMonthly =
    monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length;

  // Find peak and lowest months
  let peakMonth: PeakPeriod['month'] = null;
  let lowestMonth: PeakPeriod['lowestMonth'] = null;
  let maxAmount = -Infinity;
  let minAmount = Infinity;

  for (const m of monthlyData) {
    if (m.total > maxAmount) {
      maxAmount = m.total;
      peakMonth = {
        month: m.month,
        amount: m.total,
        percentAboveAverage:
          avgMonthly > 0 ? ((m.total - avgMonthly) / avgMonthly) * 100 : 0,
      };
    }
    if (m.total < minAmount) {
      minAmount = m.total;
      lowestMonth = {
        month: m.month,
        amount: m.total,
      };
    }
  }

  // Find peak day
  const byDay = groupByDay(transactions);
  let peakDay: PeakPeriod['day'] = null;
  let maxDayAmount = -Infinity;

  for (const [dateStr, txns] of byDay) {
    const dayTotal = txns.reduce((sum, t) => sum + t.amount, 0);
    if (dayTotal > maxDayAmount) {
      maxDayAmount = dayTotal;
      peakDay = {
        date: new Date(dateStr),
        amount: dayTotal,
        transactionCount: txns.length,
      };
    }
  }

  return { month: peakMonth, lowestMonth, day: peakDay };
}

/**
 * Get date range of transactions
 */
export function getDateRange(transactions: Transaction[]): {
  start: Date;
  end: Date;
  durationDays: number;
  monthCount: number;
} | null {
  if (transactions.length === 0) return null;

  const sorted = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const start = sorted[0].date;
  const end = sorted[sorted.length - 1].date;

  const months = eachMonthOfInterval({
    start: startOfMonth(start),
    end: endOfMonth(end),
  });

  return {
    start,
    end,
    durationDays: differenceInDays(end, start) + 1,
    monthCount: months.length,
  };
}
