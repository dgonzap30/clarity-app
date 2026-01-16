import { Card, CardContent } from '@/components/ui/card';
import type { Transaction, Category } from '@/types';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NonBudgetedCategoryCardProps {
  category: Category;
  transactions: Transaction[];
  month: Date;
  onClick?: () => void;
}

function formatPercentChange(percent: number): string {
  const abs = Math.abs(percent);
  if (abs >= 1000) {
    return `${(abs / 1000).toFixed(1)}k`;
  }
  return abs.toFixed(0);
}

export function NonBudgetedCategoryCard({ category, transactions, month, onClick }: NonBudgetedCategoryCardProps) {
  // Filter transactions for this category and month
  const monthTransactions = transactions.filter(
    (t) =>
      t.category.id === category.id &&
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate previous month for comparison
  const prevMonth = new Date(month);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const prevMonthTransactions = transactions.filter(
    (t) =>
      t.category.id === category.id &&
      t.date.getMonth() === prevMonth.getMonth() &&
      t.date.getFullYear() === prevMonth.getFullYear()
  );

  const prevMonthSpent = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const difference = spent - prevMonthSpent;
  const percentChange = prevMonthSpent > 0 ? (difference / prevMonthSpent) * 100 : 0;
  const isIncrease = difference > 0;
  const hasChange = difference !== 0;

  return (
    <Card
      variant="interactive"
      className="overflow-hidden flex flex-col h-full"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col h-full">
        {/* Header: Category name and badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium text-sm truncate">{category.name}</span>
          </div>
          {prevMonthSpent > 0 && (
            <div
              className={`flex items-center gap-0.5 text-xs font-medium flex-shrink-0 px-1.5 py-0.5 rounded ${
                isIncrease
                  ? 'text-destructive bg-destructive/10'
                  : 'text-success bg-success/10'
              }`}
            >
              {isIncrease ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatPercentChange(percentChange)}%</span>
            </div>
          )}
        </div>

        {/* Main amount */}
        <div className="mb-3">
          <span className="text-2xl sm:text-3xl font-bold tabular-nums">
            {formatCurrency(spent)}
          </span>
        </div>

        {/* Comparison section */}
        <div className="flex-1 space-y-2">
          {prevMonthSpent > 0 ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>vs</span>
                <span className="font-medium">{formatCompactCurrency(prevMonthSpent)}</span>
                <span>last month</span>
              </div>
              {hasChange && (
                <div className={`flex items-center gap-1 text-xs ${isIncrease ? 'text-destructive' : 'text-success'}`}>
                  {isIncrease ? (
                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="font-medium tabular-nums">
                    {formatCompactCurrency(Math.abs(difference))}
                  </span>
                  <span className="text-muted-foreground">
                    {isIncrease ? 'more' : 'less'}
                  </span>
                </div>
              )}
            </>
          ) : spent > 0 ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Minus className="h-3 w-3" />
              <span>No prior data</span>
            </div>
          ) : null}
        </div>

        {/* Transaction count - footer */}
        <div className="pt-3 mt-auto border-t">
          <span className="text-xs text-muted-foreground tabular-nums">
            {monthTransactions.length} transaction{monthTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
