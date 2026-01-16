import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { Gauge, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import type { UserSettings } from '@/types/settings';

interface SpendingVelocityCardProps {
  transactions: Transaction[];
  month: Date;
  settings: UserSettings;
}

export function SpendingVelocityCard({
  transactions,
  month,
  settings,
}: SpendingVelocityCardProps) {
  // Calculate total budget
  const totalBudget = useMemo(() => {
    return settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);
  }, [settings]);

  // Calculate spending metrics
  const metrics = useMemo(() => {
    const monthTransactions = transactions.filter(
      (t) =>
        t.date.getMonth() === month.getMonth() &&
        t.date.getFullYear() === month.getFullYear()
    );

    const budgetedCategoryIds = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([id]) => id);

    const totalSpent = monthTransactions
      .filter((t) => budgetedCategoryIds.includes(t.category.id))
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate days
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear();
    const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
    const daysRemaining = daysInMonth - daysPassed;

    // Current daily rate
    const currentDailyRate = daysPassed > 0 ? totalSpent / daysPassed : 0;

    // Target daily rate (what we should be spending per day to hit budget exactly)
    const targetDailyRate = daysInMonth > 0 ? totalBudget / daysInMonth : 0;

    // Ideal remaining rate (what we can spend daily with remaining days)
    const remaining = totalBudget - totalSpent;
    const idealDailyRate = daysRemaining > 0 ? remaining / daysRemaining : 0;

    // Projected total based on current rate
    const projectedTotal = currentDailyRate * daysInMonth;

    // Gauge percentage (current vs target rate)
    const gaugePercent = targetDailyRate > 0 ? (currentDailyRate / targetDailyRate) * 100 : 0;

    // Status
    const isOnPace = currentDailyRate <= targetDailyRate;
    const willExceed = projectedTotal > totalBudget;

    return {
      totalSpent,
      currentDailyRate,
      targetDailyRate,
      idealDailyRate,
      projectedTotal,
      daysRemaining,
      gaugePercent,
      isOnPace,
      willExceed,
      isCurrentMonth,
    };
  }, [transactions, month, settings, totalBudget]);

  // Don't show for past months or if no budget
  if (!metrics.isCurrentMonth || totalBudget === 0) {
    return null;
  }

  const {
    currentDailyRate,
    targetDailyRate,
    idealDailyRate,
    daysRemaining,
    gaugePercent,
    isOnPace,
    willExceed,
  } = metrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="h-5 w-5 text-[hsl(var(--accent-green))]" />
          Spending Velocity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gauge visualization */}
          <div className="relative">
            {/* Progress bar as gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Pace</span>
                <span className={cn(
                  'font-medium',
                  isOnPace ? 'text-[hsl(var(--budget-safe))]' : 'text-[hsl(var(--budget-warning))]'
                )}>
                  {gaugePercent.toFixed(0)}% of target
                </span>
              </div>
              <Progress
                value={Math.min(gaugePercent, 200)} // Cap at 200% for visualization
                max={200}
                status={isOnPace ? 'success' : willExceed ? 'danger' : 'warning'}
                className="h-4"
              />
              {/* Target marker */}
              <div className="relative h-2">
                <div
                  className="absolute top-0 h-full w-0.5 bg-muted-foreground"
                  style={{ left: '50%' }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                    Target
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily rates comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current rate */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {isOnPace ? (
                  <TrendingDown className="h-4 w-4 text-[hsl(var(--budget-safe))]" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-[hsl(var(--budget-warning))]" />
                )}
                <span className="text-xs text-muted-foreground">Current Rate</span>
              </div>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(currentDailyRate)}
                <span className="text-sm font-normal text-muted-foreground">/day</span>
              </p>
            </div>

            {/* Target rate */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Target Rate</span>
              <p className="text-xl font-bold tabular-nums text-muted-foreground">
                {formatCurrency(targetDailyRate)}
                <span className="text-sm font-normal">/day</span>
              </p>
            </div>
          </div>

          {/* Actionable advice */}
          <div className={cn(
            'p-4 rounded-lg border',
            isOnPace
              ? 'bg-[hsl(var(--budget-safe)/0.05)] border-[hsl(var(--budget-safe)/0.2)]'
              : 'bg-[hsl(var(--budget-warning)/0.08)] border-[hsl(var(--budget-warning)/0.3)]'
          )}>
            <div className="flex items-start gap-3">
              {isOnPace ? (
                <TrendingDown className="h-5 w-5 text-[hsl(var(--budget-safe))] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-[hsl(var(--budget-warning))] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isOnPace
                    ? 'Great! You\'re on track'
                    : willExceed
                    ? 'Reduce spending to stay on budget'
                    : 'Watch your spending pace'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daysRemaining > 0 ? (
                    <>
                      You can spend <span className="font-semibold">{formatCurrency(idealDailyRate)}/day</span> for the next {daysRemaining} days
                      {idealDailyRate < 0 && ' (already over budget)'}
                    </>
                  ) : (
                    'Month has ended'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
