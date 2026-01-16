import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import type { OverallAnalytics } from '@/hooks/useOverallAnalytics';
import type { Category } from '@/types';
import { calculateMovingAverage } from '@/lib/analytics-utils';
import {
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface OverallTrendsProps {
  analytics: OverallAnalytics;
  categories: Record<string, Category>;
  categoryList: Category[];
}

export function OverallTrends({ analytics }: OverallTrendsProps) {
  const { monthlyData, yearlyData, monthlyAverage } = analytics;

  // Prepare monthly chart data with moving average
  const monthlyChartData = useMemo(() => {
    if (monthlyData.length === 0) return [];

    const amounts = monthlyData.map((m) => m.total);
    const movingAvg = calculateMovingAverage(amounts, 3);

    return monthlyData.map((m, i) => ({
      month: m.month,
      total: m.total,
      movingAvg: movingAvg[i],
      average: monthlyAverage,
    }));
  }, [monthlyData, monthlyAverage]);

  // Prepare yearly chart data
  const yearlyChartData = useMemo(() => {
    return yearlyData.map((y) => ({
      year: y.year.toString(),
      total: y.total,
      monthlyAvg: y.monthlyAverage,
    }));
  }, [yearlyData]);

  if (monthlyData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Not enough data to show trends
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-green))]" />
            Monthly Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
                  }
                  width={55}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), '']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Monthly Total"
                  stroke="#06D6A0"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  name="3-Month Avg"
                  stroke="#118AB2"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Overall Avg"
                  stroke="#EF476F"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Comparison Chart */}
      {yearlyData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              Year-over-Year Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyChartData}>
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12 }}
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
                    width={55}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), '']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Yearly Total"
                    fill="#06D6A0"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yearly Stats Cards */}
      {yearlyData.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {yearlyData.map((y, i) => {
            const prevYear = yearlyData[i - 1];
            const change = prevYear
              ? ((y.total - prevYear.total) / prevYear.total) * 100
              : null;

            return (
              <Card key={y.year}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">{y.year}</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(y.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: {formatCurrency(y.monthlyAverage)}/mo
                      </p>
                    </div>
                    {change !== null && (
                      <div
                        className={`text-sm font-medium ${
                          change > 0 ? 'text-destructive' : 'text-success'
                        }`}
                      >
                        {change > 0 ? '+' : ''}
                        {change.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
