import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Category, Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useMemo } from 'react';

import type { BudgetConfig } from '@/types/settings';

interface CategoryDetailModalProps {
  category: Category | null;
  transactions: Transaction[];
  onClose: () => void;
  budget?: BudgetConfig;
}

export function CategoryDetailModal({
  category,
  transactions,
  onClose,
  budget,
}: CategoryDetailModalProps) {
  const categoryTransactions = useMemo(() => {
    if (!category) return [];
    return transactions
      .filter((t) => t.category.id === category.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [category, transactions]);

  const stats = useMemo(() => {
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = categoryTransactions.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [categoryTransactions]);

  const budgetInfo = useMemo(() => {
    if (!budget?.enabled || !budget.amount) return null;
    const spent = stats.total;
    const budgetAmount = budget.amount;
    const remaining = budgetAmount - spent;
    const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    let status: 'success' | 'warning' | 'danger' = 'success';
    if (percentUsed >= 100) status = 'danger';
    else if (percentUsed >= 80) status = 'warning';

    return { spent, budget: budgetAmount, remaining, percentUsed, status };
  }, [budget, stats]);

  return (
    <Dialog open={!!category} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: category?.color }}
            />
            <span>{category?.name} Details</span>
          </DialogTitle>
          <DialogDescription>
            View spending details and transaction history for this category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Status */}
          {budgetInfo && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget Status</span>
                <Badge
                  variant={
                    budgetInfo.status === 'danger'
                      ? 'destructive'
                      : budgetInfo.status === 'warning'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {budgetInfo.percentUsed >= 100
                    ? 'Over Budget'
                    : budgetInfo.percentUsed >= 80
                      ? 'Warning'
                      : 'On Track'}
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{formatCurrency(budgetInfo.spent)}</span>
                <span className="text-sm text-muted-foreground">
                  of {formatCurrency(budgetInfo.budget)}
                </span>
              </div>
              <Progress value={Math.min(budgetInfo.percentUsed, 100)} status={budgetInfo.status} />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{budgetInfo.percentUsed.toFixed(0)}%</span>
                <span
                  className={
                    budgetInfo.remaining < 0 ? 'text-destructive font-medium' : 'text-muted-foreground'
                  }
                >
                  {budgetInfo.remaining < 0
                    ? `-${formatCurrency(Math.abs(budgetInfo.remaining))}`
                    : `${formatCurrency(budgetInfo.remaining)} remaining`}
                </span>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div className="text-xl font-bold">{formatCurrency(stats.total)}</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Transactions</div>
              <div className="text-xl font-bold">{stats.count}</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="text-xl font-bold">{formatCurrency(stats.average)}</div>
            </div>
          </div>

          {/* Transactions Table */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Recent Transactions</h3>
            {categoryTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions in this category
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{formatDate(t.date)}</TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[300px]">{t.merchant}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {t.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(t.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
