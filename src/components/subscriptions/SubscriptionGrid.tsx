import { SubscriptionCard } from './SubscriptionCard';
import { AddSubscriptionCard } from './AddSubscriptionCard';
import { EmptyState } from '@/components/ui/empty-state';
import { CreditCard } from 'lucide-react';
import type { Subscription } from '@/types/subscription';

interface SubscriptionGridProps {
  subscriptions: Subscription[];
  onSubscriptionClick?: (subscription: Subscription) => void;
  onAddClick?: () => void;
}

export function SubscriptionGrid({ subscriptions, onSubscriptionClick, onAddClick }: SubscriptionGridProps) {
  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No subscriptions detected"
        description="Upload your transactions to automatically detect recurring subscriptions, or they will be detected as you add more data."
      />
    );
  }

  // Sort: active first, then by amount (descending)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    // Active subscriptions first
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    // Then by amount
    return b.amount - a.amount;
  });

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
      {sortedSubscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onClick={() => onSubscriptionClick?.(subscription)}
        />
      ))}
      <AddSubscriptionCard onClick={onAddClick} />
    </div>
  );
}
