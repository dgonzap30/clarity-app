import { CheckCircle, PauseCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/types/subscription';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  SubscriptionStatus,
  {
    variant: 'success' | 'secondary' | 'destructive' | 'warning';
    label: string;
    Icon: typeof CheckCircle;
  }
> = {
  active: { variant: 'success', label: 'Active', Icon: CheckCircle },
  paused: { variant: 'secondary', label: 'Paused', Icon: PauseCircle },
  cancelled: { variant: 'secondary', label: 'Cancelled', Icon: PauseCircle },
  pending: { variant: 'warning', label: 'Pending', Icon: Clock },
};

export function SubscriptionStatusBadge({ status, size = 'md' }: SubscriptionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.Icon;

  return (
    <Badge variant={config.variant} className={size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm'}>
      <Icon className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1'} />
      {config.label}
    </Badge>
  );
}
