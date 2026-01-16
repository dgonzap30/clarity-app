import { useMemo } from 'react';
import type { Transaction, Category } from '@/types';
import {
  aggregateMerchants,
  calculateMonthlyData,
  calculateYearlyData,
  calculateMedian,
  calculateStandardDeviation,
  findPeakPeriods,
  getDateRange,
  type MerchantData,
  type MonthlyData,
  type YearlyData,
  type PeakPeriod,
} from '@/lib/analytics-utils';

/**
 * Category totals for all-time analytics
 */
export interface CategoryTotal {
  id: string;
  name: string;
  color: string;
  total: number;
  count: number;
  percentOfTotal: number;
  monthlyAverage: number;
}

/**
 * All-time analytics summary
 */
export interface OverallAnalytics {
  // Summary stats
  totalSpending: number;
  transactionCount: number;
  dateRange: { start: Date; end: Date; durationDays: number; monthCount: number } | null;

  // Averages
  monthlyAverage: number;
  medianMonthly: number;
  averageTransaction: number;
  standardDeviation: number;

  // Peak periods
  peakPeriods: PeakPeriod;

  // Monthly breakdown
  monthlyData: MonthlyData[];

  // Yearly breakdown
  yearlyData: YearlyData[];

  // Category analytics
  categoryTotals: CategoryTotal[];

  // Merchant analytics
  merchantRankings: MerchantData[];
}

/**
 * Hook for all-time analytics calculations
 */
export function useOverallAnalytics(
  transactions: Transaction[],
  categories: Record<string, Category>
): OverallAnalytics {
  return useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalSpending: 0,
        transactionCount: 0,
        dateRange: null,
        monthlyAverage: 0,
        medianMonthly: 0,
        averageTransaction: 0,
        standardDeviation: 0,
        peakPeriods: { month: null, lowestMonth: null, day: null },
        monthlyData: [],
        yearlyData: [],
        categoryTotals: [],
        merchantRankings: [],
      };
    }

    // Basic stats
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.length;
    const averageTransaction = totalSpending / transactionCount;

    // Date range
    const dateRange = getDateRange(transactions);

    // Monthly data
    const monthlyData = calculateMonthlyData(transactions);
    const monthlyAmounts = monthlyData.map((m) => m.total);

    // Monthly averages
    const monthlyAverage =
      monthlyAmounts.length > 0
        ? monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length
        : 0;
    const medianMonthly = calculateMedian(monthlyAmounts);
    const standardDeviation = calculateStandardDeviation(monthlyAmounts);

    // Yearly data
    const yearlyData = calculateYearlyData(transactions);

    // Peak periods
    const peakPeriods = findPeakPeriods(transactions);

    // Category totals
    const categoryMap = new Map<
      string,
      { total: number; count: number; category: Category }
    >();

    for (const t of transactions) {
      const catId = t.category.id;
      const existing = categoryMap.get(catId);
      if (existing) {
        existing.total += t.amount;
        existing.count += 1;
      } else {
        categoryMap.set(catId, {
          total: t.amount,
          count: 1,
          category: categories[catId] || t.category,
        });
      }
    }

    const categoryTotals: CategoryTotal[] = [];
    for (const [id, data] of categoryMap) {
      categoryTotals.push({
        id,
        name: data.category.name,
        color: data.category.color,
        total: data.total,
        count: data.count,
        percentOfTotal: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
        monthlyAverage: dateRange?.monthCount
          ? data.total / dateRange.monthCount
          : data.total,
      });
    }

    // Sort by total descending
    categoryTotals.sort((a, b) => b.total - a.total);

    // Merchant rankings
    const merchantRankings = aggregateMerchants(transactions, categories);

    return {
      totalSpending,
      transactionCount,
      dateRange,
      monthlyAverage,
      medianMonthly,
      averageTransaction,
      standardDeviation,
      peakPeriods,
      monthlyData,
      yearlyData,
      categoryTotals,
      merchantRankings,
    };
  }, [transactions, categories]);
}
