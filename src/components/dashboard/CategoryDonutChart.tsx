import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction, Category } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface CategoryDonutChartProps {
  transactions: Transaction[];
  categories: Record<string, Category>;
}

export function CategoryDonutChart({ transactions, categories }: CategoryDonutChartProps) {
  const categoryTotals = transactions.reduce((acc, t) => {
    const categoryId = t.category.id;
    acc[categoryId] = (acc[categoryId] || 0) + t.amount;
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

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              cornerRadius={4}
              dataKey="value"
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  className="transition-all duration-200 hover:opacity-90 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="font-semibold text-sm">{data.name}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold">{formatCurrency(data.value)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Percent:</span>
                        <span className="font-medium">{formatPercent(data.percent)}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value, entry: any) => (
                <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                  {value} ({formatPercent(entry.payload.percent)})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
