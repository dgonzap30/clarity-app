import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyStateCompact } from '@/components/ui/empty-state';
import type { Transaction, Category } from '@/types';
import type { UserSettings } from '@/types/settings';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

interface MonthlyTrendChartProps {
  transactions: Transaction[];
  categories: Record<string, Category>;
  categoryList: Category[];
  compact?: boolean;
  categoryFilter?: 'budgeted' | 'non-budgeted' | 'all';
  currentMonth?: Date;
  settings?: UserSettings;
}

export function MonthlyTrendChart({
  transactions,
  categories,
  categoryList,
  compact = false,
  categoryFilter = 'all',
  currentMonth,
  settings,
}: MonthlyTrendChartProps) {
  // Filter transactions based on category filter
  const filteredTransactions = transactions.filter((t) => {
    if (categoryFilter === 'all') return true;

    const cat = categories[t.category.id];
    const isBudgeted = cat?.hasBudget ?? false;
    return categoryFilter === 'budgeted' ? isBudgeted : !isBudgeted;
  });

  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const monthKey = format(t.date, 'MMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        total: 0,
        count: 0,
        categorySpending: {} as Record<string, number>
      };
    }
    acc[monthKey].total += t.amount;
    acc[monthKey].count += 1;

    // Track spending by category for this month
    const catId = t.category.id;
    acc[monthKey].categorySpending[catId] = (acc[monthKey].categorySpending[catId] || 0) + t.amount;

    return acc;
  }, {} as Record<string, { month: string; total: number; count: number; categorySpending: Record<string, number> }>);

  const data = Object.values(monthlyData)
    .map((monthData) => {
      // Find dominant category (highest spending) for this month
      let dominantCategoryId = 'uncategorized';
      let maxSpending = 0;

      Object.entries(monthData.categorySpending).forEach(([catId, spending]) => {
        if (spending > maxSpending) {
          maxSpending = spending;
          dominantCategoryId = catId;
        }
      });

      return {
        ...monthData,
        dominantCategory: dominantCategoryId,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  // Calculate budget and budget status for each month
  const totalBudget = useMemo(() => {
    if (!settings) return null;

    return settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);
  }, [settings]);

  // Enhance data with budget status
  const enhancedData = useMemo(() => {
    if (!totalBudget || !settings) return data;

    const budgetedCategoryIds = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([id]) => id);

    return data.map((monthData) => {
      const monthDate = new Date(monthData.month);
      const monthTransactions = filteredTransactions.filter((t) => {
        return (
          t.date.getMonth() === monthDate.getMonth() &&
          t.date.getFullYear() === monthDate.getFullYear() &&
          budgetedCategoryIds.includes(t.category.id)
        );
      });

      const budgetedSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentUsed = totalBudget > 0 ? (budgetedSpent / totalBudget) * 100 : 0;
      const variance = budgetedSpent - totalBudget;

      let budgetStatus: 'safe' | 'warning' | 'over' = 'safe';
      if (percentUsed >= 100) budgetStatus = 'over';
      else if (percentUsed >= 70) budgetStatus = 'warning';

      const isCurrentMonth =
        currentMonth &&
        monthDate.getMonth() === currentMonth.getMonth() &&
        monthDate.getFullYear() === currentMonth.getFullYear();

      return {
        ...monthData,
        budgetedSpent,
        percentUsed,
        variance,
        budgetStatus,
        isCurrentMonth,
      };
    });
  }, [data, totalBudget, settings, filteredTransactions, currentMonth]);

  const dataToRender = totalBudget ? enhancedData : data;

  // Calculate max value for Y-axis domain (include budget if present)
  const maxValue = Math.max(
    ...dataToRender.map(d => d.total),
    totalBudget || 0,
    0
  );
  const yAxisMax = maxValue < 1000
    ? Math.ceil(maxValue * 1.5 / 100) * 100
    : Math.ceil(maxValue * 1.1 / 10000) * 10000;

  return (
    <Card className={`overflow-hidden ${compact ? 'flex flex-col h-full' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Monthly Spending Trend</CardTitle>
        {data.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {data.length} month{data.length !== 1 ? 's' : ''} of data
          </p>
        )}
      </CardHeader>
      <CardContent className={`px-6 pb-6 pt-0 ${compact ? 'flex-1 flex flex-col' : ''}`}>
        {data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center min-h-[330px]">
            <EmptyStateCompact
              variant="no-data"
              icon={BarChart3}
              title="No trend data yet"
              description="Add transactions to see your spending trends over time."
            />
          </div>
        ) : compact ? (
          <div
            className="flex-1 min-h-[330px] min-w-0"
            role="img"
            aria-label={`Monthly spending trend bar chart showing ${data.length} months of data. ${
              data.length > 0
                ? `Total spending ranges from ${formatCurrency(Math.min(...data.map(d => d.total)))} to ${formatCurrency(Math.max(...data.map(d => d.total)))}.`
                : ''
            }`}
          >
            {/* Hidden summary for screen readers */}
            <div className="sr-only">
              <h4>Monthly Spending Data</h4>
              <ul>
                {data.map((item) => (
                  <li key={item.month}>
                    {item.month}: {formatCurrency(item.total)} ({item.count} transactions)
                  </li>
                ))}
              </ul>
            </div>
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={330}>
            <BarChart
              data={dataToRender}
              margin={{
                top: 10,
                right: compact ? 10 : 20,
                left: compact ? 0 : 10,
                bottom: compact ? 50 : 50
              }}
              barCategoryGap="15%"
            >
              <defs>
                {/* Budget status gradients */}
                <linearGradient id="gradient-budget-safe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--budget-safe))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--budget-safe))" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="gradient-budget-warning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--budget-warning))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--budget-warning))" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="gradient-budget-over" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--budget-danger))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--budget-danger))" stopOpacity={0.7} />
                </linearGradient>
                {/* Generate gradient for each category */}
                {categoryList.map(cat => (
                  <linearGradient key={cat.id} id={`gradient-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cat.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={cat.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
                {/* Fallback gradient */}
                <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: compact ? 10 : 11,
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                angle={-45}
                textAnchor="end"
                height={compact ? 50 : 50}
                interval={0}
                tickMargin={10}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tick={{
                  fontSize: compact ? 10 : 11,
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value}`;
                }}
                domain={[0, yAxisMax || 'auto']}
                width={compact ? 45 : 55}
                stroke="hsl(var(--border))"
              />
              {/* Budget reference line */}
              {totalBudget && (
                <ReferenceLine
                  y={totalBudget}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Budget: ${formatCurrency(totalBudget)}`,
                    position: 'right',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
              )}
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-lg animate-fade-in">
                      <p className="font-semibold text-sm mb-2">{label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Total:</span>
                          <span className="font-bold text-sm text-primary">
                            {formatCurrency(data.total)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Transactions:</span>
                          <span className="text-sm font-medium">{data.count}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Average:</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(data.total / data.count)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {!compact && (
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px', fontWeight: 500 }}>
                      {value}
                    </span>
                  )}
                />
              )}
              <Bar
                dataKey="total"
                fill="#8884d8"
                name="Total Spending"
                radius={[6, 6, 0, 0]}
                maxBarSize={compact ? 50 : 70}
                animationDuration={800}
                animationEasing="ease-out"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;

                  // Use budget status colors if available
                  let gradientId;
                  if (payload.budgetStatus) {
                    gradientId = `gradient-budget-${payload.budgetStatus}`;
                  } else {
                    const dominantCat = payload.dominantCategory || 'default';
                    gradientId = `gradient-${dominantCat}`;
                  }

                  // Highlight current month with thicker border
                  const strokeWidth = payload.isCurrentMonth ? 3 : 0;
                  const stroke = payload.isCurrentMonth ? 'hsl(var(--primary))' : 'none';

                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={`url(#${gradientId})`}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      rx={6}
                      ry={6}
                      className="chart-bar cursor-pointer"
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        ) : (
          <div
            role="img"
            aria-label={`Monthly spending trend bar chart showing ${data.length} months of data. ${
              data.length > 0
                ? `Total spending ranges from ${formatCurrency(Math.min(...data.map(d => d.total)))} to ${formatCurrency(Math.max(...data.map(d => d.total)))}.`
                : ''
            }`}
          >
            {/* Hidden summary for screen readers */}
            <div className="sr-only">
              <h4>Monthly Spending Data</h4>
              <ul>
                {data.map((item) => (
                  <li key={item.month}>
                    {item.month}: {formatCurrency(item.total)} ({item.count} transactions)
                  </li>
                ))}
              </ul>
            </div>
            <ResponsiveContainer width="100%" height={400} minWidth={300}>
              <BarChart
                data={dataToRender}
                margin={{
                  top: 10,
                  right: compact ? 10 : 20,
                  left: compact ? 0 : 10,
                  bottom: compact ? 50 : 50
                }}
                barCategoryGap="15%"
              >
                <defs>
                  {/* Budget status gradients */}
                  <linearGradient id="gradient-budget-safe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--budget-safe))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--budget-safe))" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="gradient-budget-warning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--budget-warning))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--budget-warning))" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="gradient-budget-over" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--budget-danger))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--budget-danger))" stopOpacity={0.7} />
                  </linearGradient>
                  {/* Generate gradient for each category */}
                  {categoryList.map(cat => (
                  <linearGradient key={cat.id} id={`gradient-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cat.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={cat.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
                {/* Fallback gradient */}
                <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: compact ? 10 : 11,
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                angle={-45}
                textAnchor="end"
                height={compact ? 50 : 50}
                interval={0}
                tickMargin={10}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tick={{
                  fontSize: compact ? 10 : 11,
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value}`;
                }}
                domain={[0, yAxisMax || 'auto']}
                width={compact ? 45 : 55}
                stroke="hsl(var(--border))"
              />
              {/* Budget reference line */}
              {totalBudget && (
                <ReferenceLine
                  y={totalBudget}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Budget: ${formatCurrency(totalBudget)}`,
                    position: 'right',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
              )}
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-lg animate-fade-in">
                      <p className="font-semibold text-sm mb-2">{label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Total:</span>
                          <span className="font-bold text-sm text-primary">
                            {formatCurrency(data.total)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Transactions:</span>
                          <span className="text-sm font-medium">{data.count}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Average:</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(data.total / data.count)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {!compact && (
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px', fontWeight: 500 }}>
                      {value}
                    </span>
                  )}
                />
              )}
              <Bar
                dataKey="total"
                fill="#8884d8"
                name="Total Spending"
                radius={[6, 6, 0, 0]}
                maxBarSize={compact ? 50 : 70}
                animationDuration={800}
                animationEasing="ease-out"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;

                  // Use budget status colors if available
                  let gradientId;
                  if (payload.budgetStatus) {
                    gradientId = `gradient-budget-${payload.budgetStatus}`;
                  } else {
                    const dominantCat = payload.dominantCategory || 'default';
                    gradientId = `gradient-${dominantCat}`;
                  }

                  // Highlight current month with thicker border
                  const strokeWidth = payload.isCurrentMonth ? 3 : 0;
                  const stroke = payload.isCurrentMonth ? 'hsl(var(--primary))' : 'none';

                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={`url(#${gradientId})`}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      rx={6}
                      ry={6}
                      className="chart-bar cursor-pointer"
                    />
                  );
                }}
              />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
