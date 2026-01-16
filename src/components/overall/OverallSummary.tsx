import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import type { OverallAnalytics } from '@/hooks/useOverallAnalytics';
import {
  TrendingUp,
  Calendar,
  CreditCard,
  BarChart3,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { format } from 'date-fns';

interface OverallSummaryProps {
  analytics: OverallAnalytics;
}

export function OverallSummary({ analytics }: OverallSummaryProps) {
  const {
    totalSpending,
    transactionCount,
    dateRange,
    monthlyAverage,
    medianMonthly,
    averageTransaction,
    standardDeviation,
    peakPeriods,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Hero Card - Total Spending */}
      <Card variant="hero">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total All-Time Spending</p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient">
                {formatCurrency(totalSpending)}
              </p>
              {dateRange && (
                <p className="text-sm text-muted-foreground mt-2">
                  {format(dateRange.start, 'MMMM yyyy')} — {format(dateRange.end, 'MMMM yyyy')}
                  <span className="ml-2">({dateRange.monthCount} months)</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold">{transactionCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              {dateRange && (
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{dateRange.monthCount}</p>
                  <p className="text-xs text-muted-foreground">Months</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Average</p>
                <p className="text-lg font-bold">{formatCurrency(monthlyAverage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <Target className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Median</p>
                <p className="text-lg font-bold">{formatCurrency(medianMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Transaction</p>
                <p className="text-lg font-bold">{formatCurrency(averageTransaction)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <Zap className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Std Deviation</p>
                <p className="text-lg font-bold">{formatCurrency(standardDeviation)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Spending Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-green))]" />
            Peak Spending Periods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Peak Month */}
            {peakPeriods.month && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ArrowUp className="h-4 w-4 text-destructive" />
                  <span>Highest Month</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(peakPeriods.month.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">{peakPeriods.month.month}</p>
                <p className="text-xs text-destructive mt-1">
                  +{peakPeriods.month.percentAboveAverage.toFixed(0)}% above average
                </p>
              </div>
            )}

            {/* Lowest Month */}
            {peakPeriods.lowestMonth && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ArrowDown className="h-4 w-4 text-success" />
                  <span>Lowest Month</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(peakPeriods.lowestMonth.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">{peakPeriods.lowestMonth.month}</p>
              </div>
            )}

            {/* Peak Day */}
            {peakPeriods.day && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span>Highest Single Day</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(peakPeriods.day.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(peakPeriods.day.date, 'MMMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {peakPeriods.day.transactionCount} transactions
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
