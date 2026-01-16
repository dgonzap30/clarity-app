import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import type { Transaction, Category } from '@/types';
import type { UserSettings } from '@/types/settings';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, TrendingUp, TrendingDown, Calendar, Target, Zap } from 'lucide-react';
import { subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface TotalHeroCardProps {
  transactions: Transaction[];
  month: Date;
  budgetedCategories: Category[];
  nonBudgetedCategories: Category[];
  settings?: UserSettings;
  onUploadClick?: () => void;
  onNavigateToBudget?: () => void;
  onFilterClick?: (type: 'budgeted' | 'non-budgeted') => void;
}

export function TotalHeroCard({
  transactions,
  month,
  budgetedCategories,
  nonBudgetedCategories,
  settings,
  onUploadClick,
  onNavigateToBudget,
  onFilterClick,
}: TotalHeroCardProps) {
  // Filter transactions for the current month
  const monthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  // Calculate total spending
  const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = monthTransactions.length;

  // Calculate budgeted vs non-budgeted spending
  const budgetedSpent = monthTransactions
    .filter((t) => budgetedCategories.some(c => c.id === t.category.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const nonBudgetedSpent = monthTransactions
    .filter((t) => nonBudgetedCategories.some(c => c.id === t.category.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetedPercentage = totalSpent > 0 ? (budgetedSpent / totalSpent) * 100 : 0;
  const nonBudgetedPercentage = totalSpent > 0 ? (nonBudgetedSpent / totalSpent) * 100 : 0;

  // Calculate previous month for comparison
  const prevMonth = new Date(month);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const prevMonthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === prevMonth.getMonth() &&
      t.date.getFullYear() === prevMonth.getFullYear()
  );

  const prevMonthTotal = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const difference = totalSpent - prevMonthTotal;
  const percentChange = prevMonthTotal > 0 ? (difference / prevMonthTotal) * 100 : 0;
  const isIncrease = difference > 0;

  // Calculate daily average
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();

  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;

  // Calculate budget status if settings provided
  const budgetStatus = useMemo(() => {
    if (!settings) return null;

    const totalBudget = settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);

    if (totalBudget === 0) return null;

    const percentUsed = (budgetedSpent / totalBudget) * 100;
    const remaining = totalBudget - budgetedSpent;

    let status: 'safe' | 'warning' | 'over' = 'safe';
    if (percentUsed >= 100) status = 'over';
    else if (percentUsed >= 70) status = 'warning';

    return {
      totalBudget,
      percentUsed,
      remaining,
      status,
    };
  }, [settings, budgetedSpent]);

  // Calculate spending velocity (last 7 days vs previous 7 days)
  const velocity = useMemo(() => {
    if (!isCurrentMonth) return null;

    const sevenDaysAgo = subDays(today, 7);
    const fourteenDaysAgo = subDays(today, 14);

    const lastWeekTransactions = monthTransactions.filter(
      (t) => t.date >= sevenDaysAgo && t.date <= today
    );
    const prevWeekTransactions = monthTransactions.filter(
      (t) => t.date >= fourteenDaysAgo && t.date < sevenDaysAgo
    );

    const lastWeekSpent = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
    const prevWeekSpent = prevWeekTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (prevWeekSpent === 0) return null;

    const change = lastWeekSpent - prevWeekSpent;
    const percentChange = (change / prevWeekSpent) * 100;

    return {
      direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      percentChange: Math.abs(percentChange),
      lastWeekSpent,
      prevWeekSpent,
    };
  }, [monthTransactions, isCurrentMonth, today]);

  // Show empty state if no transactions
  if (monthTransactions.length === 0) {
    return (
      <Card variant="hero" className="overflow-hidden">
        <CardContent className="p-6">
          <EmptyState
            variant="no-transactions"
            title="No spending this month"
            description="There are no transactions recorded for this period. Upload a CSV file to get started."
            action={onUploadClick ? { label: 'Upload CSV', onClick: onUploadClick } : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="hero" className="overflow-hidden">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header with total */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Total Spending</p>
            <div className="space-y-3">
              <span className="text-5xl sm:text-6xl font-bold tracking-tight animate-count-up">
                {formatCurrency(totalSpent)}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Budget status badge */}
                {budgetStatus && onNavigateToBudget && (
                  <button
                    onClick={onNavigateToBudget}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:opacity-80",
                      budgetStatus.status === 'safe' && "bg-[hsl(var(--budget-safe)/0.1)] text-[hsl(var(--budget-safe))] border border-[hsl(var(--budget-safe)/0.3)]",
                      budgetStatus.status === 'warning' && "bg-[hsl(var(--budget-warning)/0.15)] text-[hsl(var(--budget-warning))] border border-[hsl(var(--budget-warning)/0.4)]",
                      budgetStatus.status === 'over' && "bg-[hsl(var(--budget-danger)/0.15)] text-[hsl(var(--budget-danger))] border border-[hsl(var(--budget-danger)/0.5)]"
                    )}
                  >
                    <Target className="h-3 w-3" />
                    <span>Budget: {budgetStatus.percentUsed.toFixed(0)}%</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Transaction count and velocity */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</span>
            </div>
            {velocity && (
              <div
                className={cn(
                  'flex items-center gap-1.5',
                  velocity.direction === 'increasing' ? 'text-[hsl(var(--budget-warning))]' : 'text-[hsl(var(--budget-safe))]'
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {velocity.direction === 'increasing' ? '↑' : '↓'} {velocity.percentChange.toFixed(0)}% vs last week
                </span>
              </div>
            )}
          </div>

          {/* Comparison with previous month */}
          {prevMonthTotal > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-2 ${isIncrease ? 'text-destructive' : 'text-success'}`}>
                {isIncrease ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {Math.abs(percentChange).toFixed(1)}%
                </span>
              </div>
              <span className="text-muted-foreground">
                {isIncrease ? 'increase' : 'decrease'} from last month ({formatCurrency(prevMonthTotal)})
              </span>
            </div>
          )}

          {/* Budgeted vs Non-Budgeted Split */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Spending Breakdown</span>
              <span className="text-muted-foreground">{formatCurrency(totalSpent)}</span>
            </div>

            {/* Budgeted Progress */}
            <div
              className={cn(
                "space-y-2 p-2 rounded-lg transition-colors",
                onFilterClick && "cursor-pointer hover:bg-muted/30 active:scale-[0.99]"
              )}
              onClick={() => onFilterClick?.('budgeted')}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
                  <span className="font-medium">Budgeted Categories</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(budgetedSpent)}</span>
                  <span className="text-muted-foreground ml-1">({budgetedPercentage.toFixed(1)}%)</span>
                </div>
              </div>
              <Progress value={budgetedPercentage} className="h-2" />
            </div>

            {/* Non-Budgeted Progress */}
            <div
              className={cn(
                "space-y-2 p-2 rounded-lg transition-colors",
                onFilterClick && "cursor-pointer hover:bg-muted/30 active:scale-[0.99]"
              )}
              onClick={() => onFilterClick?.('non-budgeted')}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground ring-2 ring-background" />
                  <span className="font-medium">Non-Budgeted Categories</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(nonBudgetedSpent)}</span>
                  <span className="text-muted-foreground ml-1">({nonBudgetedPercentage.toFixed(1)}%)</span>
                </div>
              </div>
              <Progress value={nonBudgetedPercentage} className="h-2" />
            </div>
          </div>

          {/* Daily Average */}
          <div className="flex items-center gap-3 pt-6 border-t">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Daily Average</p>
              <p className="text-xl font-semibold">{formatCurrency(dailyAverage)}</p>
            </div>
            {isCurrentMonth && (
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Days Passed</p>
                <p className="text-base font-medium">{daysPassed} / {daysInMonth}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
