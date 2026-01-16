import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyStateCompact } from '@/components/ui/empty-state';
import type { Transaction, Category } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, TrendingUp } from 'lucide-react';

interface AllCategoriesSpendingProps {
  transactions: Transaction[];
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
}

export function AllCategoriesSpending({ transactions, categories, onCategoryClick }: AllCategoriesSpendingProps) {
  // Get all categories
  const allCategories = categories;

  // Calculate spending per category (transactions are already filtered for current month)
  const categorySpending = allCategories.map(category => {
    const spent = transactions
      .filter(t => t.category.id === category.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const count = transactions.filter(t => t.category.id === category.id).length;

    return {
      category,
      spent,
      count,
    };
  })
    .filter(item => item.spent > 0) // Only show categories with spending
    .sort((a, b) => b.spent - a.spent); // Sort by amount (highest first)

  const totalSpent = categorySpending.reduce((sum, item) => sum + item.spent, 0);

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Spending by Category</CardTitle>
        {totalSpent > 0 && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalSpent)} across {categorySpending.length} categor{categorySpending.length !== 1 ? 'ies' : 'y'}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="space-y-2">
          {categorySpending.length === 0 ? (
            <EmptyStateCompact
              variant="no-transactions"
              icon={Wallet}
              title="No spending yet"
              description="Your categories are waiting for their first transactions."
            />
          ) : (
            <>
              {categorySpending.map(({ category, spent, count }, index) => {
                const percentage = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;

                return (
                  <div
                    key={category.id}
                    className="group space-y-2 p-3 rounded-lg hover:bg-accent/50 hover:translate-x-1 transition-all duration-150 cursor-pointer animate-stagger-in"
                    style={{ animationDelay: `${index * 25}ms` }}
                    onClick={() => onCategoryClick?.(category)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-3 w-3 rounded-full ring-2 ring-background shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium truncate">{category.name}</span>
                        {category.hasBudget && (
                          <TrendingUp className="h-3 w-3 text-primary shrink-0" />
                        )}
                      </div>
                      <div className="text-right shrink-0">
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
                <span className="text-sm font-semibold">Total Spending</span>
                <span className="text-lg font-bold">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
