import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Transaction, Category } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Wallet } from 'lucide-react';

interface NonBudgetedSpendingProps {
  transactions: Transaction[];
  month: Date;
  nonBudgetedCategories: Category[];
  onCategoryClick?: (category: Category) => void;
}

export function NonBudgetedSpending({ transactions, month, nonBudgetedCategories, onCategoryClick }: NonBudgetedSpendingProps) {
  // Filter transactions for the current month
  const monthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  // Calculate spending per category
  const categorySpending = nonBudgetedCategories.map(category => {
    const spent = monthTransactions
      .filter(t => t.category.id === category.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const count = monthTransactions.filter(t => t.category.id === category.id).length;

    return {
      category,
      spent,
      count,
    };
  })
    .filter(item => item.spent > 0) // Only show categories with spending
    .sort((a, b) => b.spent - a.spent); // Sort by amount (highest first)

  const totalNonBudgeted = categorySpending.reduce((sum, item) => sum + item.spent, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Non-Budgeted Spending</CardTitle>
        {totalNonBudgeted > 0 && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalNonBudgeted)} across {categorySpending.length} categor{categorySpending.length !== 1 ? 'ies' : 'y'}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="space-y-2">
          {categorySpending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No spending in non-budgeted categories</p>
            </div>
          ) : (
            <>
              {categorySpending.map(({ category, spent, count }) => {
                const percentage = totalNonBudgeted > 0 ? (spent / totalNonBudgeted) * 100 : 0;

                return (
                  <div key={category.id} className="group space-y-2 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer hover:shadow-sm" onClick={() => onCategoryClick?.(category)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full ring-2 ring-background transition-transform duration-200 group-hover:scale-125"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold">
                          {formatCurrency(spent)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% of total</span>
                      <span>{count} transaction{count !== 1 ? 's' : ''}</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
              <div className="pt-4 mt-3 border-t flex items-center justify-between px-3">
                <span className="text-sm font-semibold">Total Non-Budgeted</span>
                <span className="text-lg font-bold">
                  {formatCurrency(totalNonBudgeted)}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
