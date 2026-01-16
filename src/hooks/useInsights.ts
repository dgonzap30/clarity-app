import { useMemo } from 'react';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export interface CategoryInsight {
  categoryId: string;
  categoryName: string;
  currentSpent: number;
  previousSpent: number;
  percentChange: number;
  isIncrease: boolean;
  insight: string;
  severity: 'info' | 'success' | 'warning';
}

export interface MonthlyInsight {
  type: 'comparison' | 'pattern' | 'achievement' | 'alert';
  title: string;
  description: string;
  icon: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface InsightsResult {
  topInsight: MonthlyInsight | null;
  categoryInsights: CategoryInsight[];
  dailyAverageInsight: string;
  dailyAverage: number;
  dailyAverageTrend: number; // Percentage change vs last month
  projectionInsight: string;
  projectedTotal: number;
  projectionTrend: number; // Percentage change vs last month
  topSpendingCategory: { name: string; amount: number } | null;
  biggestChange: CategoryInsight | null;
}

/**
 * useInsights - Calculate spending insights by comparing current month to previous month
 *
 * Analyzes transactions to provide:
 * - Category-level spending changes
 * - Daily average comparisons
 * - Projected monthly totals
 * - Top spending categories
 * - Smart contextual insights
 *
 * @param transactions - All transactions
 * @param selectedMonth - Current month being viewed
 */
export function useInsights(
  transactions: Transaction[],
  selectedMonth: Date
): InsightsResult {
  return useMemo(() => {
    // Get current and previous month transactions
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();

    const currentMonthTx = transactions.filter(
      (t) => t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
    );

    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    const prevMonthTx = transactions.filter(
      (t) =>
        t.date.getMonth() === prevMonth.getMonth() &&
        t.date.getFullYear() === prevMonth.getFullYear()
    );

    // Calculate totals
    const currentTotal = currentMonthTx.reduce((sum, t) => sum + t.amount, 0);
    const prevTotal = prevMonthTx.reduce((sum, t) => sum + t.amount, 0);

    // Category-level analysis
    const categoryInsights: CategoryInsight[] = [];
    const categorySpending: Record<
      string,
      { current: number; previous: number; name: string }
    > = {};

    // Aggregate spending by category
    currentMonthTx.forEach((t) => {
      if (!categorySpending[t.category.id]) {
        categorySpending[t.category.id] = {
          current: 0,
          previous: 0,
          name: t.category.name,
        };
      }
      categorySpending[t.category.id].current += t.amount;
    });

    prevMonthTx.forEach((t) => {
      if (!categorySpending[t.category.id]) {
        categorySpending[t.category.id] = {
          current: 0,
          previous: 0,
          name: t.category.name,
        };
      }
      categorySpending[t.category.id].previous += t.amount;
    });

    // Generate category insights
    Object.entries(categorySpending).forEach(([categoryId, spending]) => {
      const percentChange =
        spending.previous > 0
          ? ((spending.current - spending.previous) / spending.previous) * 100
          : spending.current > 0
          ? 100
          : 0;

      const isIncrease = spending.current > spending.previous;

      let insight = '';
      let severity: 'info' | 'success' | 'warning' = 'info';

      if (Math.abs(percentChange) < 10) {
        insight = `${spending.name} spending is consistent with last month`;
        severity = 'info';
      } else if (isIncrease) {
        if (percentChange > 50) {
          insight = `${spending.name} spending up ${percentChange.toFixed(0)}%! Worth reviewing`;
          severity = 'warning';
        } else {
          insight = `${spending.name} spending increased by ${percentChange.toFixed(0)}%`;
          severity = 'info';
        }
      } else {
        if (Math.abs(percentChange) > 30) {
          insight = `Great job! ${spending.name} down ${Math.abs(percentChange).toFixed(0)}%`;
          severity = 'success';
        } else {
          insight = `${spending.name} spending reduced by ${Math.abs(percentChange).toFixed(0)}%`;
          severity = 'success';
        }
      }

      categoryInsights.push({
        categoryId,
        categoryName: spending.name,
        currentSpent: spending.current,
        previousSpent: spending.previous,
        percentChange,
        isIncrease,
        insight,
        severity,
      });
    });

    // Sort by absolute percent change (most significant first)
    categoryInsights.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));

    // Calculate daily average insight
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
    const dailyAverage = daysPassed > 0 ? currentTotal / daysPassed : 0;

    const prevDaysInMonth = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0
    ).getDate();
    const prevDailyAverage = prevDaysInMonth > 0 ? prevTotal / prevDaysInMonth : 0;

    const dailyChange = prevDailyAverage > 0
      ? ((dailyAverage - prevDailyAverage) / prevDailyAverage) * 100
      : 0;

    let dailyAverageInsight = '';
    if (prevDailyAverage > 0) {
      if (dailyChange > 10) {
        dailyAverageInsight = `Up ${dailyChange.toFixed(0)}% vs last month`;
      } else if (dailyChange < -10) {
        dailyAverageInsight = `Down ${Math.abs(dailyChange).toFixed(0)}% - nice!`;
      } else {
        dailyAverageInsight = 'Consistent with last month';
      }
    } else {
      dailyAverageInsight = `${formatCurrency(dailyAverage)}/day`;
    }

    // Projection insight
    const projected = dailyAverage * daysInMonth;
    const projectionChange = prevTotal > 0
      ? ((projected - prevTotal) / prevTotal) * 100
      : 0;

    let projectionInsight = '';
    if (prevTotal > 0) {
      if (projected > prevTotal * 1.2) {
        projectionInsight = `${formatCurrency(projected - prevTotal)} more than last month`;
      } else if (projected < prevTotal * 0.8) {
        projectionInsight = `Save ${formatCurrency(prevTotal - projected)} vs last month!`;
      } else {
        projectionInsight = 'Similar to last month';
      }
    } else {
      projectionInsight = `${formatCurrency(projected)} projected`;
    }

    // Top spending category
    const sortedByAmount = [...categoryInsights].sort((a, b) => b.currentSpent - a.currentSpent);
    const topSpendingCategory = sortedByAmount[0]
      ? { name: sortedByAmount[0].categoryName, amount: sortedByAmount[0].currentSpent }
      : null;

    // Biggest change
    const biggestChange = categoryInsights[0] || null;

    // Generate top insight
    let topInsight: MonthlyInsight | null = null;

    const totalChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    if (currentMonthTx.length === 0) {
      topInsight = {
        type: 'pattern',
        title: 'Fresh Month Ahead',
        description: 'No transactions recorded yet. Your budget is ready!',
        icon: 'Sparkles',
        severity: 'info',
      };
    } else if (totalChange < -20) {
      topInsight = {
        type: 'achievement',
        title: 'Major Savings!',
        description: `You're spending ${Math.abs(totalChange).toFixed(0)}% less than last month`,
        icon: 'TrendingDown',
        severity: 'success',
      };
    } else if (totalChange > 30) {
      topInsight = {
        type: 'alert',
        title: 'Spending Spike Detected',
        description: `Spending is up ${totalChange.toFixed(0)}% vs last month`,
        icon: 'TrendingUp',
        severity: 'warning',
      };
    } else if (biggestChange && Math.abs(biggestChange.percentChange) > 40) {
      topInsight = {
        type: 'comparison',
        title: `${biggestChange.categoryName} Changed Significantly`,
        description: biggestChange.insight,
        icon: biggestChange.isIncrease ? 'TrendingUp' : 'TrendingDown',
        severity: biggestChange.severity === 'warning' ? 'warning' : 'info',
      };
    }

    return {
      topInsight,
      categoryInsights,
      dailyAverageInsight,
      dailyAverage,
      dailyAverageTrend: dailyChange,
      projectionInsight,
      projectedTotal: projected,
      projectionTrend: projectionChange,
      topSpendingCategory,
      biggestChange,
    };
  }, [transactions, selectedMonth]);
}
