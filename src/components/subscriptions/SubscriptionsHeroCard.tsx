import { RefreshCw, CalendarClock, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import type { UpcomingRenewal } from '@/types/subscription';
import { cn } from '@/lib/utils';

interface SubscriptionsHeroCardProps {
  totalMonthlySpend: number;
  annualProjection: number;
  activeCount: number;
  upcomingRenewals: UpcomingRenewal[];
  onRefresh?: () => void;
  isDetecting?: boolean;
}

export function SubscriptionsHeroCard({
  totalMonthlySpend,
  annualProjection,
  activeCount,
  upcomingRenewals,
  onRefresh,
  isDetecting,
}: SubscriptionsHeroCardProps) {
  const upcomingThisWeek = upcomingRenewals.filter((r) => r.daysUntil <= 7).length;

  const stats = [
    {
      label: 'Monthly Cost',
      value: formatCurrency(totalMonthlySpend),
      icon: CreditCard,
    },
    {
      label: 'Annual Projection',
      value: formatCurrency(annualProjection),
      icon: TrendingUp,
    },
    {
      label: 'Active Subscriptions',
      value: activeCount.toString(),
      icon: RefreshCw,
    },
    {
      label: 'Due This Week',
      value: upcomingThisWeek.toString(),
      icon: CalendarClock,
    },
  ];

  return (
    <Card variant="hero" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header with monthly cost */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Subscriptions</p>
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient">
                {formatCurrency(totalMonthlySpend)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="text-base px-3 py-1">
                {activeCount} Active
              </Badge>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isDetecting}
                  className="gap-2"
                >
                  <RefreshCw className={cn('h-4 w-4', isDetecting && 'animate-spin')} />
                  {isDetecting ? 'Scanning...' : 'Rescan'}
                </Button>
              )}
            </div>
          </div>

          {/* Stats grid - 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <stat.icon className="h-3.5 w-3.5" />
                  <span>{stat.label}</span>
                </div>
                <span
                  className={cn(
                    'text-lg font-semibold',
                    index === 0 && 'text-[hsl(var(--accent-green))]'
                  )}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
