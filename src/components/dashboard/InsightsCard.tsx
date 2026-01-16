import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraBackground } from '@/components/ui/aurora-background';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Clock,
  Target,
  Award,
  Store,
} from 'lucide-react';
import type { InsightsResult } from '@/hooks/useInsights';
import type { Category, Transaction } from '@/types';
import type { UserSettings } from '@/types/settings';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface InsightsCardProps {
  insights: InsightsResult;
  categories: Record<string, Category>;
  transactions?: Transaction[];
  month?: Date;
  settings?: UserSettings;
}

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Lightbulb,
};

/**
 * InsightsCard - Display smart spending insights with clean stat card layout
 */
export function InsightsCard({ insights, categories, transactions, month, settings }: InsightsCardProps) {
  const {
    topInsight,
    categoryInsights,
    dailyAverage,
    dailyAverageTrend,
    projectedTotal,
    projectionTrend,
  } = insights;

  // Get top 5 category changes
  const topCategoryInsights = categoryInsights.slice(0, 5);

  // Calculate budget-specific insights
  const budgetInsights = useMemo(() => {
    if (!settings || !transactions || !month) return null;

    const totalBudget = settings.enableTotalBudget && settings.totalMonthlyBudget
      ? settings.totalMonthlyBudget
      : Object.entries(settings.budgets)
          .filter(([, config]) => config.enabled)
          .reduce((sum, [, config]) => sum + config.amount, 0);

    if (totalBudget === 0) return null;

    const budgetedCategoryIds = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([id]) => id);

    const monthTransactions = transactions.filter(
      (t) =>
        t.date.getMonth() === month.getMonth() &&
        t.date.getFullYear() === month.getFullYear()
    );

    const budgetedSpent = monthTransactions
      .filter((t) => budgetedCategoryIds.includes(t.category.id))
      .reduce((sum, t) => sum + t.amount, 0);

    const percentUsed = (budgetedSpent / totalBudget) * 100;
    const remaining = totalBudget - budgetedSpent;

    // Find best performing category (lowest % of budget used)
    const categoryPerformance = Object.entries(settings.budgets)
      .filter(([, config]) => config.enabled)
      .map(([categoryId, config]) => {
        const categorySpent = monthTransactions
          .filter((t) => t.category.id === categoryId)
          .reduce((sum, t) => sum + t.amount, 0);

        const percentOfBudget = config.amount > 0 ? (categorySpent / config.amount) * 100 : 0;

        return {
          id: categoryId,
          name: transactions.find((t) => t.category.id === categoryId)?.category.name || categoryId,
          percentUsed: percentOfBudget,
          spent: categorySpent,
          budget: config.amount,
        };
      })
      .filter((cat) => cat.spent > 0)
      .sort((a, b) => a.percentUsed - b.percentUsed);

    const bestCategory = categoryPerformance.length > 0 ? categoryPerformance[0] : null;

    // Calculate actionable recommendation
    const today = new Date();
    const isCurrentMonth =
      month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear();

    let recommendation = null;
    if (isCurrentMonth) {
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const daysPassed = today.getDate();
      const daysRemaining = daysInMonth - daysPassed;

      if (daysRemaining > 0) {
        const dailyRate = daysPassed > 0 ? budgetedSpent / daysPassed : 0;
        const targetDailyRate = totalBudget / daysInMonth;
        const suggestedDailyRate = Math.max(0, remaining / daysRemaining);

        if (dailyRate > targetDailyRate) {
          const reductionNeeded = dailyRate - suggestedDailyRate;
          recommendation = {
            message: `Reduce by ${formatCurrency(reductionNeeded)}/day to stay on budget`,
            severity: percentUsed >= 100 ? 'danger' : 'warning',
          };
        }
      }
    }

    // Find top merchant this month
    const merchantMap = new Map<string, number>();
    monthTransactions.forEach((t) => {
      merchantMap.set(t.merchant, (merchantMap.get(t.merchant) || 0) + t.amount);
    });

    const topMerchant = Array.from(merchantMap.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      percentUsed,
      remaining,
      bestCategory,
      recommendation,
      topMerchant: topMerchant ? { name: topMerchant[0], spent: topMerchant[1] } : null,
    };
  }, [settings, transactions, month]);

  // Determine if we have positive insights for aurora animation
  const hasPositiveInsight =
    topInsight?.severity === 'success' ||
    (dailyAverageTrend < 0 && projectionTrend < 0) ||
    (budgetInsights && budgetInsights.percentUsed < 70);

  return (
    <Card variant="elevated">
      <AuroraBackground variant="subtle" animated={hasPositiveInsight ?? undefined}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-aurora-insight" />
            Smart Insights
          </CardTitle>
          <CardDescription>Compared to last month</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Three equal stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Top Insight Stat Card */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2">
                {topInsight && iconMap[topInsight.icon as keyof typeof iconMap] ? (
                  <>
                    {(() => {
                      const Icon = iconMap[topInsight.icon as keyof typeof iconMap];
                      const iconColorMap = {
                        info: 'text-blue-500',
                        success: 'text-success',
                        warning: 'text-warning',
                        danger: 'text-destructive',
                      };
                      return (
                        <div className={cn('h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0', iconColorMap[topInsight.severity])}>
                          <Icon className="h-5 w-5" />
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0 text-muted-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Top Insight
                </p>
              </div>
              <div className="flex-1">
                {topInsight ? (
                  <>
                    <p className="text-lg font-bold mb-1 leading-tight">{topInsight.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {topInsight.description}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not enough data yet
                  </p>
                )}
              </div>
            </div>

            {/* Daily Pace Stat Card */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-aurora-insight" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Daily Pace
                </p>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold tracking-tight mb-2">
                  {formatCurrency(dailyAverage)}
                  <span className="text-sm text-muted-foreground font-normal">/day</span>
                </p>
                {dailyAverageTrend !== 0 && (
                  <div className="flex items-center gap-1.5">
                    {dailyAverageTrend > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-success" />
                    )}
                    <span className={cn(
                      'text-sm font-medium tabular-nums',
                      dailyAverageTrend > 0 ? 'text-destructive' : 'text-success'
                    )}>
                      {Math.abs(dailyAverageTrend).toFixed(0)}% vs last month
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Projection Stat Card */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-aurora-insight" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Projection
                </p>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold tracking-tight mb-2">
                  {formatCurrency(projectedTotal)}
                </p>
                {projectionTrend !== 0 && (
                  <div className="flex items-center gap-1.5">
                    {projectionTrend > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-success" />
                    )}
                    <span className={cn(
                      'text-sm font-medium tabular-nums',
                      projectionTrend > 0 ? 'text-destructive' : 'text-success'
                    )}>
                      {Math.abs(projectionTrend).toFixed(0)}% vs last month
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category changes */}
          {topCategoryInsights.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Top Category Changes
              </h3>
              <div className="space-y-2">
                {topCategoryInsights.map((insight) => {
                  const category = categories[insight.categoryId];
                  return (
                    <div
                      key={insight.categoryId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Category color dot */}
                      {category && (
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                      )}

                      {/* Category name */}
                      <span className="flex-1 font-medium text-sm truncate">
                        {insight.categoryName}
                      </span>

                      {/* Amount change */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                          {formatCurrency(insight.previousSpent)} → {formatCurrency(insight.currentSpent)}
                        </span>
                        <Badge
                          variant={insight.isIncrease ? 'destructive' : 'success'}
                          className="tabular-nums font-mono text-xs px-2"
                        >
                          {insight.isIncrease ? '+' : ''}
                          {insight.percentChange.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budget-specific insights */}
          {budgetInsights && (
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Budget Insights
              </h3>
              <div className="space-y-2">
                {/* Best category */}
                {budgetInsights.bestCategory && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--budget-safe)/0.05)] border border-[hsl(var(--budget-safe)/0.2)]">
                    <Award className="h-4 w-4 text-[hsl(var(--budget-safe))] shrink-0" />
                    <p className="text-sm flex-1">
                      <span className="font-semibold">{budgetInsights.bestCategory.name}</span> is {budgetInsights.bestCategory.percentUsed.toFixed(0)}% of budget - on track for {formatCurrency(budgetInsights.bestCategory.spent)}
                    </p>
                  </div>
                )}

                {/* Top merchant */}
                {budgetInsights.topMerchant && (
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm flex-1">
                      Top merchant: <span className="font-semibold">{budgetInsights.topMerchant.name}</span> ({formatCurrency(budgetInsights.topMerchant.spent)})
                    </p>
                  </div>
                )}

                {/* Recommendation */}
                {budgetInsights.recommendation && (
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    budgetInsights.recommendation.severity === 'danger'
                      ? "bg-[hsl(var(--budget-danger)/0.08)] border-[hsl(var(--budget-danger)/0.3)]"
                      : "bg-[hsl(var(--budget-warning)/0.08)] border-[hsl(var(--budget-warning)/0.3)]"
                  )}>
                    <AlertTriangle className={cn(
                      "h-4 w-4 shrink-0",
                      budgetInsights.recommendation.severity === 'danger'
                        ? "text-[hsl(var(--budget-danger))]"
                        : "text-[hsl(var(--budget-warning))]"
                    )} />
                    <p className="text-sm flex-1 font-medium">
                      {budgetInsights.recommendation.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {topCategoryInsights.length === 0 && !topInsight && !budgetInsights && (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Not enough data yet. Insights will appear after your first month!
              </p>
            </div>
          )}
        </CardContent>
      </AuroraBackground>
    </Card>
  );
}
