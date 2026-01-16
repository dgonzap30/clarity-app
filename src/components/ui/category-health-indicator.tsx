import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryHealthIndicatorProps {
  percentUsed: number;
  daysRemaining?: number;
  projectedOverspend?: number;
  variant?: 'badge' | 'pill' | 'ring';
  className?: string;
}

export function CategoryHealthIndicator({
  percentUsed,
  daysRemaining,
  projectedOverspend,
  variant = 'badge',
  className,
}: CategoryHealthIndicatorProps) {
  // Determine health status based on percentUsed
  const getStatus = () => {
    if (percentUsed >= 100) return 'over';
    if (percentUsed >= 70) return 'warning';
    return 'safe';
  };

  const status = getStatus();

  // Status configurations
  const statusConfig = {
    safe: {
      label: 'On Track',
      icon: Check,
      color: 'text-[hsl(var(--budget-safe))]',
      bgColor: 'bg-[hsl(var(--budget-safe)/0.1)]',
      borderColor: 'border-[hsl(var(--budget-safe)/0.3)]',
      variant: 'default' as const,
    },
    warning: {
      label: 'Caution',
      icon: AlertTriangle,
      color: 'text-[hsl(var(--budget-warning))]',
      bgColor: 'bg-[hsl(var(--budget-warning)/0.15)]',
      borderColor: 'border-[hsl(var(--budget-warning)/0.4)]',
      variant: 'default' as const,
    },
    over: {
      label: 'Over Budget',
      icon: XCircle,
      color: 'text-[hsl(var(--budget-danger))]',
      bgColor: 'bg-[hsl(var(--budget-danger)/0.15)]',
      borderColor: 'border-[hsl(var(--budget-danger)/0.5)]',
      variant: 'destructive' as const,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Badge variant - simple colored badge
  if (variant === 'badge') {
    return (
      <Badge
        variant={config.variant}
        className={cn(
          'budget-status-transition',
          className
        )}
      >
        {config.label}
      </Badge>
    );
  }

  // Pill variant - larger with icon and text
  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm budget-status-transition',
          config.bgColor,
          config.color,
          config.borderColor,
          'border',
          className
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{config.label}</span>
        {projectedOverspend && projectedOverspend > 0 && (
          <span className="text-xs opacity-75">
            (Est. +${projectedOverspend.toFixed(0)})
          </span>
        )}
      </div>
    );
  }

  // Ring variant - circular progress indicator
  if (variant === 'ring') {
    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        {/* SVG circular progress */}
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${Math.min(percentUsed, 100)} 100`}
            className={cn(
              'budget-status-transition',
              config.color
            )}
            strokeLinecap="round"
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
      </div>
    );
  }

  return null;
}
