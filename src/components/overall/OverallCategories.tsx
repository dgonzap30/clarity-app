import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import type { OverallAnalytics } from '@/hooks/useOverallAnalytics';
import type { Category } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface OverallCategoriesProps {
  analytics: OverallAnalytics;
  categoryList: Category[];
}

export function OverallCategories({ analytics, categoryList }: OverallCategoriesProps) {
  const { categoryTotals, monthlyData } = analytics;

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return categoryTotals.map((cat) => ({
      name: cat.name,
      value: cat.total,
      color: cat.color,
    }));
  }, [categoryTotals]);

  // Build the stacked area data from monthlyData
  const evolutionData = useMemo(() => {
    return monthlyData.map((m) => {
      const row: Record<string, number | string> = { month: m.month };
      for (const cat of categoryList) {
        row[cat.id] = m.categories[cat.id] || 0;
      }
      return row;
    });
  }, [monthlyData, categoryList]);

  if (categoryTotals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No category data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Distribution Pie Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              Spending Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {categoryTotals.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{formatCurrency(cat.total)}</span>
                      <span className="text-muted-foreground ml-2">
                        ({cat.percentOfTotal.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={cat.percentOfTotal}
                    className="h-2"
                    style={
                      {
                        '--progress-background': cat.color,
                      } as React.CSSProperties
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{cat.count} transactions</span>
                    <span>~{formatCurrency(cat.monthlyAverage)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Evolution Stacked Area */}
      {evolutionData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Spending Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
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
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Legend />
                  {categoryList.map((cat) => (
                    <Area
                      key={cat.id}
                      type="monotone"
                      dataKey={cat.id}
                      name={cat.name}
                      stackId="1"
                      fill={cat.color}
                      stroke={cat.color}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {categoryTotals.slice(0, 8).map((cat, index) => (
          <Card key={cat.id} className="overflow-hidden">
            <div className="h-1" style={{ backgroundColor: cat.color }} />
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  #{index + 1}
                </div>
                <span className="font-semibold truncate">{cat.name}</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(cat.total)}</p>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{cat.percentOfTotal.toFixed(1)}% of total</span>
                <span>{cat.count} txns</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
