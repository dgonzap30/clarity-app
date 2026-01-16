import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Category } from '@/types';
import { TOTAL_MONTHLY_BUDGET } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';

interface BudgetProgressBarsProps {
  transactions: Transaction[];
  month: Date;
  budgetedCategories: Category[];
}

export function BudgetProgressBars({ transactions, month, budgetedCategories }: BudgetProgressBarsProps) {
  const monthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  const budgetData = budgetedCategories.map((category) => {
    const spent = monthTransactions
      .filter((t) => t.category.id === category.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = category.monthlyBudget || 0;
    const remaining = budget - spent;
    const percentUsed = (spent / budget) * 100;

    let status: 'on-track' | 'warning' | 'over-budget' = 'on-track';
    if (percentUsed >= 100) status = 'over-budget';
    else if (percentUsed >= 80) status = 'warning';

    return {
      category,
      spent,
      budget,
      remaining,
      percentUsed,
      status,
    };
  });

  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalPercent = (totalSpent / TOTAL_MONTHLY_BUDGET) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Budget Tracking</span>
          <Badge variant={totalPercent > 100 ? 'destructive' : 'secondary'} className="self-start sm:self-auto">
            {formatCurrency(totalSpent)} / {formatCurrency(TOTAL_MONTHLY_BUDGET)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetData.map(({ category, spent, budget, remaining, percentUsed, status }) => (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(spent)} / {formatCurrency(budget)}
              </div>
            </div>
            <Progress
              value={Math.min(percentUsed, 100)}
              className={`h-3 ${
                status === 'over-budget'
                  ? '[&>div]:bg-destructive'
                  : status === 'warning'
                  ? '[&>div]:bg-warning'
                  : '[&>div]:bg-success'
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentUsed.toFixed(1)}% used</span>
              <span className={remaining < 0 ? 'text-red-500' : ''}>
                {remaining < 0 ? 'Over by ' : 'Remaining: '}
                {formatCurrency(Math.abs(remaining))}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
