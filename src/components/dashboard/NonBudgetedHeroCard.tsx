import { Card, CardContent } from '@/components/ui/card';
import { EmptyStateCompact } from '@/components/ui/empty-state';
import type { Transaction, Category } from '@/types';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Receipt } from 'lucide-react';

interface NonBudgetedHeroCardProps {
  transactions: Transaction[];
  month: Date;
  nonBudgetedCategories: Category[];
}

function formatPercentChange(percent: number): string {
  const abs = Math.abs(percent);
  if (abs >= 1000) {
    return `${(abs / 1000).toFixed(1)}k`;
  }
  if (abs >= 100) {
    return abs.toFixed(0);
  }
  return abs.toFixed(1);
}

export function NonBudgetedHeroCard({ transactions, month, nonBudgetedCategories }: NonBudgetedHeroCardProps) {
  // Filter transactions for the current month
  const monthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  // Calculate total spent in non-budgeted categories
  const totalSpent = monthTransactions
    .filter((t) => nonBudgetedCategories.some(c => c.id === t.category.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionCount = monthTransactions.filter((t) =>
    nonBudgetedCategories.some(c => c.id === t.category.id)
  ).length;

  // Calculate previous month for comparison
  const prevMonth = new Date(month);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const prevMonthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === prevMonth.getMonth() &&
      t.date.getFullYear() === prevMonth.getFullYear()
  );

  const prevMonthTotal = prevMonthTransactions
    .filter((t) => nonBudgetedCategories.some(c => c.id === t.category.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const difference = totalSpent - prevMonthTotal;
  const percentChange = prevMonthTotal > 0 ? (difference / prevMonthTotal) * 100 : 0;
  const isIncrease = difference > 0;

  // Show empty state if no non-budgeted transactions
  if (transactionCount === 0) {
    return (
      <Card variant="hero" className="overflow-hidden">
        <CardContent className="p-6">
          <EmptyStateCompact
            variant="no-transactions"
            icon={Receipt}
            title="No non-budgeted spending"
            description="No transactions in non-budgeted categories this month."
          />
        </CardContent>
      </Card>
    );
  }

  // Get category breakdown for display
  const categoryBreakdown = nonBudgetedCategories
    .map(category => ({
      category,
      spent: monthTransactions
        .filter(t => t.category.id === category.id)
        .reduce((sum, t) => sum + t.amount, 0)
    }))
    .filter(item => item.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header section - responsive layout */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground mb-1">Total Non-Budgeted Spending</p>
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="tabular-nums">{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Comparison with previous month - improved wrapping */}
          {prevMonthTotal > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                isIncrease
                  ? 'text-destructive bg-destructive/10'
                  : 'text-success bg-success/10'
              }`}>
                {isIncrease ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span className="font-medium tabular-nums">
                  {formatPercentChange(percentChange)}%
                </span>
              </div>
              <span className="text-muted-foreground">
                {isIncrease ? 'increase' : 'decrease'} from last month
              </span>
              <span className="text-muted-foreground tabular-nums">
                ({formatCompactCurrency(prevMonthTotal)})
              </span>
            </div>
          )}

          {/* Category breakdown summary - responsive grid */}
          {categoryBreakdown.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
              {categoryBreakdown.slice(0, 4).map(({ category, spent }) => (
                <div key={category.id} className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{category.name}</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCompactCurrency(spent)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
