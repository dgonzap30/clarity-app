import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Check, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { Transaction } from '@/types';
import type { UserSettings } from '@/types/settings';

interface BudgetHistoryChartProps {
  transactions: Transaction[];
  settings: UserSettings;
  months?: number; // How many months to show (default: 6)
}

export function BudgetHistoryChart({
  transactions,
  settings,
  months = 6,
}: BudgetHistoryChartProps) {
  // Calculate total budget
  const totalBudget = useMemo(() => {
    return settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);
  }, [settings]);

  // Get budgeted category IDs
  const budgetedCategoryIds = useMemo(() => {
    return Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([id]) => id);
  }, [settings.budgets]);

  // Generate month-over-month data
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = startOfMonth(subMonths(today, i));
      const monthKey = format(monthDate, 'MMM yyyy');
      const monthShort = format(monthDate, 'MMM');

      // Filter transactions for this month and budgeted categories
      const monthTransactions = transactions.filter((t) => {
        const isInMonth =
          t.date.getMonth() === monthDate.getMonth() &&
          t.date.getFullYear() === monthDate.getFullYear();
        const isBudgeted = budgetedCategoryIds.includes(t.category.id);
        return isInMonth && isBudgeted;
      });

      const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentUsed = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

      // Determine status
      let status: 'safe' | 'warning' | 'over' = 'safe';
      if (percentUsed >= 100) status = 'over';
      else if (percentUsed >= 70) status = 'warning';

      data.push({
        month: monthShort,
        monthFull: monthKey,
        spent,
        budget: totalBudget,
        percentUsed,
        status,
        variance: spent - totalBudget,
      });
    }

    return data;
  }, [transactions, months, totalBudget, budgetedCategoryIds]);

  // Get bar color based on status
  const getBarColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'hsl(var(--budget-safe))';
      case 'warning':
        return 'hsl(var(--budget-warning))';
      case 'over':
        return 'hsl(var(--budget-danger))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <Check className="h-3 w-3 text-[hsl(var(--budget-safe))]" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-[hsl(var(--budget-warning))]" />;
      case 'over':
        return <XCircle className="h-3 w-3 text-[hsl(var(--budget-danger))]" />;
      default:
        return null;
    }
  };

  if (chartData.length === 0 || totalBudget === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-green))]" />
          Budget Trend (Last {months} Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
                  }
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'spent') return [formatCurrency(value), 'Spent'];
                    return [formatCurrency(value), name];
                  }}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.monthFull || label
                  }
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                {/* Budget limit line */}
                <ReferenceLine
                  y={totalBudget}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Budget: ${formatCurrency(totalBudget)}`,
                    position: 'right',
                    fontSize: 11,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {chartData.map((entry, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {getStatusIcon(entry.status)}
                </div>
                <p className="text-xs text-muted-foreground">{entry.month}</p>
                <p className="text-xs font-medium tabular-nums">
                  {entry.percentUsed.toFixed(0)}%
                </p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[hsl(var(--budget-safe))]" />
              <span className="text-muted-foreground">On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[hsl(var(--budget-warning))]" />
              <span className="text-muted-foreground">Caution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[hsl(var(--budget-danger))]" />
              <span className="text-muted-foreground">Over</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
