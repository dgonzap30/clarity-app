import { Calendar, Infinity } from 'lucide-react';
import { format } from 'date-fns';

interface AllTimeIndicatorProps {
  dateRange: { start: Date; end: Date } | null;
  transactionCount: number;
}

export function AllTimeIndicator({ dateRange, transactionCount }: AllTimeIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border">
      <div className="flex items-center gap-2 text-[hsl(var(--accent-green))]">
        <Infinity className="h-4 w-4" />
        <span className="font-semibold">All Time</span>
      </div>
      {dateRange && (
        <>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(dateRange.start, 'MMM yyyy')} — {format(dateRange.end, 'MMM yyyy')}
            </span>
          </div>
        </>
      )}
      <div className="h-4 w-px bg-border" />
      <span className="text-xs text-muted-foreground">
        {transactionCount.toLocaleString()} transactions
      </span>
    </div>
  );
}
