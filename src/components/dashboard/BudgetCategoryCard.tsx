import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Category } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { subMonths, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface BudgetCategoryCardProps {
  category: Category;
  transactions: Transaction[];
  month: Date;
  budget: number;
  onClick?: () => void;
}

export function BudgetCategoryCard({ category, transactions, month, budget, onClick }: BudgetCategoryCardProps) {
  // Filter transactions for this category and month
  const monthTransactions = transactions.filter(
    (t) =>
      t.category.id === category.id &&
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget - spent;
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

  // Calculate last month's spending for trend comparison
  const lastMonthSpent = useMemo(() => {
    const lastMonth = subMonths(month, 1);
    const lastMonthTransactions = transactions.filter(
      (t) =>
        t.category.id === category.id &&
        t.date.getMonth() === lastMonth.getMonth() &&
        t.date.getFullYear() === lastMonth.getFullYear()
    );
    return lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, category.id, month]);

  // Calculate trend
  const trend = useMemo(() => {
    if (lastMonthSpent === 0) return null;
    const change = spent - lastMonthSpent;
    const percentChange = (change / lastMonthSpent) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      percentChange: Math.abs(percentChange),
    };
  }, [spent, lastMonthSpent]);

  // Calculate projected end-of-month spending
  const projected = useMemo(() => {
    const today = new Date();
    const isCurrentMonth =
      month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear();

    if (!isCurrentMonth) return null;

    const daysPassed = today.getDate();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    if (daysPassed === 0) return null;

    const dailyRate = spent / daysPassed;
    const projectedTotal = dailyRate * daysInMonth;

    return projectedTotal;
  }, [spent, month]);

  // Find last transaction date
  const lastTransactionDays = useMemo(() => {
    if (monthTransactions.length === 0) return null;

    const sortedTransactions = [...monthTransactions].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    const lastTransaction = sortedTransactions[0];
    const today = new Date();

    return differenceInDays(today, lastTransaction.date);
  }, [monthTransactions]);

  // Determine status
  let status: 'on-track' | 'warning' | 'over-budget' = 'on-track';
  let progressStatus: 'success' | 'warning' | 'danger' = 'success';
  let badgeVariant: 'default' | 'secondary' | 'destructive' = 'secondary';

  if (percentUsed >= 100) {
    status = 'over-budget';
    progressStatus = 'danger';
    badgeVariant = 'destructive';
  } else if (percentUsed >= 80) {
    status = 'warning';
    progressStatus = 'warning';
    badgeVariant = 'default';
  }

  return (
    <Card
      variant="interactive"
      className={cn(
        "overflow-hidden budget-status-transition",
        percentUsed >= 100 && "border-[hsl(var(--budget-danger)/0.4)]",
        percentUsed >= 80 && percentUsed < 100 && "border-[hsl(var(--budget-warning)/0.3)]"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-semibold truncate">{category.name}</span>
            {/* Trend indicator */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs',
                  trend.direction === 'up' ? 'text-[hsl(var(--budget-warning))]' : 'text-[hsl(var(--budget-safe))]'
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="font-medium">{trend.percentChange.toFixed(0)}%</span>
              </div>
            )}
          </div>
          <Badge variant={badgeVariant} className="text-xs shrink-0">
            {status === 'over-budget' ? 'Over' : status === 'warning' ? 'Warning' : 'On Track'}
          </Badge>
        </div>
        {/* Last transaction indicator */}
        {lastTransactionDays !== null && lastTransactionDays >= 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Last: {lastTransactionDays === 0 ? 'today' : lastTransactionDays === 1 ? 'yesterday' : `${lastTransactionDays} days ago`}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 space-y-4">
        {/* Amount */}
        <div className="flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold">
            {formatCurrency(spent)}
          </span>
          <span className="text-sm text-muted-foreground">
            of {formatCurrency(budget)}
          </span>
        </div>

        {/* Progress bar with milestones */}
        <div className="space-y-1">
          <div className="relative">
            <Progress
              value={Math.min(percentUsed, 100)}
              status={progressStatus}
              className="h-3"
            />
            {/* Milestone markers */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[50, 75, 100].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute top-0 h-full w-[1px] bg-background opacity-40"
                  style={{ left: `${milestone}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentUsed.toFixed(0)}%</span>
            <span className={remaining < 0 ? 'text-destructive font-medium' : ''}>
              {remaining < 0
                ? `-${formatCurrency(Math.abs(remaining))}`
                : formatCurrency(remaining)
              }
            </span>
          </div>
        </div>

        {/* Projected total */}
        {projected && (
          <div className="flex items-center gap-2 text-xs">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Projected: <span className={cn(
                'font-semibold',
                projected > budget ? 'text-[hsl(var(--budget-warning))]' : 'text-foreground'
              )}>
                {formatCurrency(projected)}
              </span>
            </span>
          </div>
        )}

        {/* Transaction count */}
        <div className="flex items-center gap-2 text-sm pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {monthTransactions.length} transaction{monthTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
