import { CalendarClock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { UpcomingRenewal } from '@/types/subscription';
import { cn } from '@/lib/utils';

interface UpcomingRenewalsProps {
  renewals: UpcomingRenewal[];
  daysAhead?: number;
}

export function UpcomingRenewals({ renewals, daysAhead = 30 }: UpcomingRenewalsProps) {
  // Filter and sort by days until renewal
  const upcomingRenewals = renewals
    .filter((r) => r.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const getDaysLabel = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getUrgencyClass = (days: number) => {
    if (days <= 1) return 'text-destructive';
    if (days <= 3) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-5 w-5 text-[hsl(var(--accent-green))]" />
          Upcoming Renewals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingRenewals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No renewals in the next {daysAhead} days
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-custom pr-1">
            {upcomingRenewals.map((renewal, index) => (
              <div
                key={renewal.subscriptionId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-all duration-200 cursor-pointer",
                  "animate-stagger-in hover:shadow-sm"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-accent-subtle flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-[hsl(var(--accent-green))]" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">{renewal.subscriptionName}</p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {formatDate(new Date(renewal.expectedDate))}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-0.5 shrink-0">
                  <p className="font-semibold text-sm leading-tight">{formatCurrency(renewal.expectedAmount)}</p>
                  <p className={cn('text-xs leading-tight', getUrgencyClass(renewal.daysUntil))}>
                    {getDaysLabel(renewal.daysUntil)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
