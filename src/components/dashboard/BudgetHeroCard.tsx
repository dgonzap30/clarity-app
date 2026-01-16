import { useEffect, useRef, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmptyStateCompact } from '@/components/ui/empty-state';
import { SparkleEffect } from '@/components/ui/sparkle-effect';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Calendar, TrendingDown, TrendingUp, PiggyBank, Award } from 'lucide-react';
import type { UserSettings } from '@/types/settings';
import { getBudgetStatusMessage } from '@/lib/messages';
import { cn } from '@/lib/utils';

interface BudgetHeroCardProps {
  transactions: Transaction[];
  month: Date;
  settings: UserSettings;
}

export function BudgetHeroCard({ transactions, month, settings }: BudgetHeroCardProps) {
  // Calculate total budget from settings
  const totalBudget = settings.enableTotalBudget && settings.totalMonthlyBudget
    ? settings.totalMonthlyBudget
    : Object.entries(settings.budgets)
        .filter(([, config]) => config.enabled)
        .reduce((sum, [, config]) => sum + config.amount, 0);

  // Filter transactions for the current month
  const monthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  // Get budgeted categories based on settings
  const budgetedCategoryIds = Object.entries(settings.budgets)
    .filter(([, config]) => config.enabled)
    .map(([id]) => id);

  // Calculate total spent in budgeted categories
  const totalSpent = monthTransactions
    .filter((t) => budgetedCategoryIds.includes(t.category.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;

  // Calculate days
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();

  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysRemaining = daysInMonth - daysPassed;

  // Calculate daily spending rate and projection
  const dailyRate = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const projectedTotal = dailyRate * daysInMonth;
  const onPace = projectedTotal <= totalBudget;

  // Calculate suggested daily limit when not on pace
  const suggestedDailyLimit = useMemo(() => {
    if (!onPace && daysRemaining > 0) {
      const remainingBudget = totalBudget - totalSpent;
      return Math.max(0, remainingBudget / daysRemaining);
    }
    return null;
  }, [onPace, daysRemaining, totalBudget, totalSpent]);

  // Calculate best performing category
  const bestCategory = useMemo(() => {
    const categoryPerformance = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([categoryId, config]) => {
        const categorySpent = monthTransactions
          .filter((t) => t.category.id === categoryId)
          .reduce((sum, t) => sum + t.amount, 0);

        const percentOfBudget = config.amount > 0 ? (categorySpent / config.amount) * 100 : 0;

        return {
          id: categoryId,
          name: transactions.find((t) => t.category.id === categoryId)?.category.name || categoryId,
          percentUsed: percentOfBudget,
          spent: categorySpent,
          budget: config.amount,
        };
      })
      .filter((cat) => cat.spent > 0); // Only categories with spending

    // Find the category with lowest % usage (best performing)
    const sorted = categoryPerformance.sort((a, b) => a.percentUsed - b.percentUsed);
    return sorted.length > 0 ? sorted[0] : null;
  }, [settings.budgets, monthTransactions, transactions]);

  // Determine status and color
  let status: 'on-track' | 'warning' | 'over-budget' = 'on-track';
  let progressStatus: 'success' | 'warning' | 'danger' = 'success';
  let badgeVariant: 'default' | 'secondary' | 'destructive' = 'secondary';

  if (percentUsed >= 100) {
    status = 'over-budget';
    progressStatus = 'danger';
    badgeVariant = 'destructive';
  } else if (percentUsed >= 80 || projectedTotal > totalBudget) {
    status = 'warning';
    progressStatus = 'warning';
    badgeVariant = 'default';
  }

  // Track if we've already fired confetti for this month
  const confettiFired = useRef(false);
  const [sparkle, setSparkle] = useState(false);

  // Fire confetti + sparkles celebration when on track and under 50% usage
  useEffect(() => {
    if (confettiFired.current) return;

    const confettiKey = `confetti-${month.getFullYear()}-${month.getMonth()}`;
    const alreadyFired = localStorage.getItem(confettiKey);

    if (status === 'on-track' && percentUsed > 0 && percentUsed < 50 && !alreadyFired) {
      confettiFired.current = true;
      localStorage.setItem(confettiKey, 'true');

      // Fire confetti with a slight delay for better UX
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06D6A0', '#118AB2', '#7B2CBF', '#FFD166'],
        });
        // Trigger sparkle effect
        setSparkle(true);
        setTimeout(() => setSparkle(false), 2500);
      }, 300);
    }
  }, [status, percentUsed, month]);

  // Get dynamic status message
  const statusMessage = settings.preferences.enableFunMessages !== false
    ? getBudgetStatusMessage({ percentUsed, remaining, daysRemaining, isOnPace: onPace })
    : { text: status === 'over-budget' ? 'Over Budget' : status === 'warning' ? 'Watch It!' : "You're Crushing It!" };

  // Show empty state if no budgeted transactions
  const budgetedTransactions = monthTransactions.filter((t) =>
    budgetedCategoryIds.includes(t.category.id)
  );

  if (budgetedTransactions.length === 0 && totalBudget > 0) {
    return (
      <Card variant="hero" className="overflow-hidden">
        <CardContent className="p-6">
          <EmptyStateCompact
            variant="no-transactions"
            icon={PiggyBank}
            title="Perfect discipline!"
            description={`Your ${formatCurrency(totalBudget)} budget is untouched. Keep up the mindful spending!`}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        variant="hero"
        className={cn(
          "overflow-hidden border-2 budget-status-transition",
          status === 'on-track' && "border-[hsl(var(--budget-safe)/0.3)] bg-gradient-to-br from-card to-[hsl(var(--budget-safe)/0.05)]",
          status === 'warning' && "border-[hsl(var(--budget-warning)/0.4)] bg-gradient-to-br from-card to-[hsl(var(--budget-warning)/0.05)]",
          status === 'over-budget' && "border-[hsl(var(--budget-danger)/0.5)] bg-gradient-to-br from-card to-[hsl(var(--budget-danger)/0.05)]"
        )}
      >
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header with amounts */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Budget Status</p>
              <div className="space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className={cn(
                    "text-5xl sm:text-6xl font-bold tracking-tight animate-count-up",
                    status === 'on-track' && "text-gradient-teal glow-teal",
                    status === 'warning' && "text-gradient-amber glow-amber",
                    status === 'over-budget' && "text-gradient-red glow-red"
                  )}>
                    {formatCurrency(totalSpent)}
                  </span>
                  <span className="text-xl sm:text-2xl text-muted-foreground/70">
                    / {formatCurrency(totalBudget)}
                  </span>
                  <Badge variant={badgeVariant} className="text-base px-3 py-1">
                    {statusMessage.text}
                  </Badge>
                </div>
                {/* Best category info */}
                {bestCategory && status === 'on-track' && (
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--budget-safe))]">
                    <Award className="h-4 w-4" />
                    <span>
                      Best category: <span className="font-semibold">{bestCategory.name}</span> at {bestCategory.percentUsed.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress
              value={Math.min(percentUsed, 100)}
              status={progressStatus}
              className="h-3"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {percentUsed.toFixed(1)}% used
              </span>
              <span className={remaining < 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {remaining < 0 ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} remaining`}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5 items-center">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Days Remaining</p>
                <p className="text-xl font-semibold">{daysRemaining} / {daysInMonth}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`${onPace ? 'text-success' : 'text-warning'}`}>
                {onPace ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Daily Average</p>
                <p className="text-xl font-semibold">{formatCurrency(dailyRate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`${onPace ? 'text-success' : 'text-warning'}`}>
                {onPace ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Projected Total</p>
                <p className={cn(
                  "text-xl font-semibold",
                  !onPace && "text-warning"
                )}>
                  {formatCurrency(projectedTotal)}
                </p>
              </div>
            </div>
            {suggestedDailyLimit !== null && (
              <div className="sm:col-span-3 pt-4 border-t">
                <p className="text-sm">
                  <span className="text-muted-foreground">Great! You're on track</span>
                  <br />
                  <span className="text-muted-foreground">You can spend </span>
                  <span className="font-semibold text-[hsl(var(--budget-warning))]">
                    {formatCurrency(suggestedDailyLimit)}/day
                  </span>
                  <span className="text-muted-foreground"> for the next {daysRemaining} days</span>
                </p>
              </div>
            )}
            </div>
          </div>
        </CardContent>
    </Card>
    <SparkleEffect trigger={sparkle} count={50} />
  </>
  );
}
