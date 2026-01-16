import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction, Category } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface NonBudgetedDonutChartProps {
  transactions: Transaction[];
  month: Date;
  categories: Record<string, Category>;
  nonBudgetedCategories: Category[];
}

export function NonBudgetedDonutChart({ transactions, month, categories, nonBudgetedCategories }: NonBudgetedDonutChartProps) {
  // Filter transactions for the current month
  const monthTransactions = transactions.filter(
    (t) =>
      t.date.getMonth() === month.getMonth() &&
      t.date.getFullYear() === month.getFullYear()
  );

  // Calculate spending per category
  const categoryTotals = monthTransactions.reduce((acc, t) => {
    if (nonBudgetedCategories.some(c => c.id === t.category.id)) {
      const categoryId = t.category.id;
      acc[categoryId] = (acc[categoryId] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const data = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => {
      const cat = categories[categoryId] || categories['uncategorized'];
      return {
        name: cat.name,
        value: amount,
        color: cat.color,
        percent: (amount / total) * 100,
      };
    })
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No non-budgeted spending this month
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                labelFormatter={(name) => name}
              />
              <Legend
                formatter={(value, entry: any) => (
                  <span className="text-sm">
                    {value} ({formatPercent(entry.payload.percent || 0)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label with total */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{formatCurrency(total)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
