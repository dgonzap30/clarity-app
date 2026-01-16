import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Transaction } from '@/types';
import type { UserSettings } from '@/types/settings';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, CreditCard, TrendingUp as TrendingUpIcon, Calendar, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface CompactStatsBarProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  month: Date;
  settings?: UserSettings;
}

export function CompactStatsBar({ transactions, allTransactions, month, settings }: CompactStatsBarProps) {
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = transactions.length;
  const avgTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;

  // Find largest transaction
  const largestTransaction = useMemo(() => {
    if (transactions.length === 0) return 0;
    return Math.max(...transactions.map(t => t.amount));
  }, [transactions]);

  // Calculate last month's stats for comparison
  const lastMonthStats = useMemo(() => {
    const lastMonth = subMonths(month, 1);
    const lastMonthTransactions = allTransactions.filter(
      (t) =>
        t.date.getMonth() === lastMonth.getMonth() &&
        t.date.getFullYear() === lastMonth.getFullYear()
    );

    const total = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = lastMonthTransactions.length;
    const avg = count > 0 ? total / count : 0;
    const largest = count > 0 ? Math.max(...lastMonthTransactions.map(t => t.amount)) : 0;

    return { total, count, avg, largest };
  }, [allTransactions, month]);

  // Calculate trends
  const trends = useMemo(() => {
    const totalTrend = lastMonthStats.total > 0
      ? ((totalSpending - lastMonthStats.total) / lastMonthStats.total) * 100
      : 0;
    const countTrend = lastMonthStats.count > 0
      ? ((transactionCount - lastMonthStats.count) / lastMonthStats.count) * 100
      : 0;
    const avgTrend = lastMonthStats.avg > 0
      ? ((avgTransaction - lastMonthStats.avg) / lastMonthStats.avg) * 100
      : 0;
    const largestTrend = lastMonthStats.largest > 0
      ? ((largestTransaction - lastMonthStats.largest) / lastMonthStats.largest) * 100
      : 0;

    return {
      total: totalTrend,
      count: countTrend,
      avg: avgTrend,
      largest: largestTrend,
    };
  }, [totalSpending, transactionCount, avgTransaction, largestTransaction, lastMonthStats]);

  // Calculate budget percentage
  const budgetPercent = useMemo(() => {
    if (!settings) return null;

    const totalBudget = settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);

    if (totalBudget === 0) return null;

    const budgetedCategoryIds = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([id]) => id);

    const budgetedSpent = transactions
      .filter((t) => budgetedCategoryIds.includes(t.category.id))
      .reduce((sum, t) => sum + t.amount, 0);

    const percentUsed = (budgetedSpent / totalBudget) * 100;
    let status: 'safe' | 'warning' | 'over' = 'safe';
    if (percentUsed >= 100) status = 'over';
    else if (percentUsed >= 70) status = 'warning';

    return { percentUsed, status };
  }, [settings, transactions]);

  // Calculate rolling monthly average from ALL historical data
  const monthlyAvg = useMemo(() => {
    const monthTotals: Record<string, number> = {};
    allTransactions.forEach(t => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      monthTotals[key] = (monthTotals[key] || 0) + t.amount;
    });
    const totals = Object.values(monthTotals);
    return totals.length > 0
      ? totals.reduce((a, b) => a + b, 0) / totals.length
      : 0;
  }, [allTransactions]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <Stat
            icon={<DollarSign className="h-4 w-4" />}
            label="Total"
            value={formatCurrency(totalSpending)}
            trend={trends.total}
          />
          <Stat
            icon={<CreditCard className="h-4 w-4" />}
            label="Transactions"
            value={transactionCount.toString()}
            trend={trends.count}
          />
          <Stat
            icon={<TrendingUpIcon className="h-4 w-4" />}
            label="Average"
            value={formatCurrency(avgTransaction)}
            trend={trends.avg}
          />
          <Stat
            icon={<DollarSign className="h-4 w-4" />}
            label="Largest"
            value={formatCurrency(largestTransaction)}
            trend={trends.largest}
          />
          {budgetPercent && (
            <Stat
              icon={<Target className="h-4 w-4" />}
              label="Budget"
              value={`${budgetPercent.percentUsed.toFixed(0)}%`}
              budgetStatus={budgetPercent.status}
            />
          )}
          <Stat
            icon={<Calendar className="h-4 w-4" />}
            label="Monthly Avg"
            value={formatCurrency(monthlyAvg)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  budgetStatus?: 'safe' | 'warning' | 'over';
}

function Stat({ icon, label, value, trend, budgetStatus }: StatProps) {
  const hasTrend = trend !== undefined && trend !== 0;
  const trendUp = trend && trend > 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors min-w-0">
      <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-background text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="label-uppercase truncate">{label}</p>
          {hasTrend && (
            <div className={cn(
              'flex items-center',
              trendUp ? 'text-[hsl(var(--budget-warning))]' : 'text-[hsl(var(--budget-safe))]'
            )}>
              {trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </div>
          )}
        </div>
        <p className={cn(
          "text-base sm:text-lg font-bold tracking-display truncate",
          budgetStatus === 'safe' && "text-[hsl(var(--budget-safe))]",
          budgetStatus === 'warning' && "text-[hsl(var(--budget-warning))]",
          budgetStatus === 'over' && "text-[hsl(var(--budget-danger))]"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
