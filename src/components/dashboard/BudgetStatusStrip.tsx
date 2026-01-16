import { useMemo } from 'react';
import { CategoryHealthIndicator } from '@/components/ui/category-health-indicator';
import { formatCurrency } from '@/lib/formatters';
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import type { UserSettings } from '@/types/settings';

interface BudgetStatusStripProps {
  transactions: Transaction[];
  month: Date;
  settings: UserSettings;
  onNavigateToBudget?: () => void;
}

export function BudgetStatusStrip({
  transactions,
  month,
  settings,
  onNavigateToBudget,
}: BudgetStatusStripProps) {
  // Calculate total budget
  const totalBudget = useMemo(() => {
    return settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);
  }, [settings]);

  // Filter transactions for current month and budgeted categories
  const { totalSpent, percentUsed, remaining } = useMemo(() => {
    const monthTransactions = transactions.filter(
      (t) =>
        t.date.getMonth() === month.getMonth() &&
        t.date.getFullYear() === month.getFullYear()
    );

    const budgetedCategoryIds = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([id]) => id);

    const spent = monthTransactions
      .filter((t) => budgetedCategoryIds.includes(t.category.id))
      .reduce((sum, t) => sum + t.amount, 0);

    const pct = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
    const rem = totalBudget - spent;

    return {
      totalSpent: spent,
      percentUsed: pct,
      remaining: rem,
    };
  }, [transactions, month, settings, totalBudget]);

  // Calculate days remaining
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();
  const daysRemaining = isCurrentMonth ? daysInMonth - today.getDate() : 0;

  // Determine status color
  const getStatusColor = () => {
    if (percentUsed >= 100) return 'budget-danger';
    if (percentUsed >= 70) return 'budget-warning';
    return 'budget-safe';
  };

  const statusColor = getStatusColor();

  // Don't show for non-current months or if no budget
  if (!isCurrentMonth || totalBudget === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-300',
        'hover:shadow-md active:scale-[0.99]',
        'budget-status-transition',
        statusColor === 'budget-safe' && 'bg-[hsl(var(--budget-safe)/0.05)] border-[hsl(var(--budget-safe)/0.2)]',
        statusColor === 'budget-warning' && 'bg-[hsl(var(--budget-warning)/0.08)] border-[hsl(var(--budget-warning)/0.3)]',
        statusColor === 'budget-danger' && 'bg-[hsl(var(--budget-danger)/0.08)] border-[hsl(var(--budget-danger)/0.3)]'
      )}
      onClick={onNavigateToBudget}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Progress ring + amounts */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <CategoryHealthIndicator
            percentUsed={percentUsed}
            variant="ring"
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-bold tabular-nums">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-sm text-muted-foreground">
                of {formatCurrency(totalBudget)}
              </span>
            </div>
            <div className={cn(
              'text-xs sm:text-sm font-medium flex items-center gap-1',
              remaining < 0 ? 'text-[hsl(var(--budget-danger))]' : 'text-muted-foreground'
            )}>
              {remaining < 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  <span>Over by {formatCurrency(Math.abs(remaining))}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  <span>{formatCurrency(remaining)} left</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status + days remaining */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {daysRemaining > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{daysRemaining} days left</span>
              <span className="sm:hidden">{daysRemaining}d</span>
            </div>
          )}
          <CategoryHealthIndicator
            percentUsed={percentUsed}
            variant="pill"
          />
        </div>
      </div>

      {/* Mobile-optimized progress bar */}
      <div className="mt-3 sm:hidden">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              statusColor === 'budget-safe' && 'bg-[hsl(var(--budget-safe))]',
              statusColor === 'budget-warning' && 'bg-[hsl(var(--budget-warning))]',
              statusColor === 'budget-danger' && 'bg-[hsl(var(--budget-danger))]'
            )}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
