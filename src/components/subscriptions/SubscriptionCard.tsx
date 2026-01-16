import { Calendar, Tv, Music, Bot, Cloud, Heart, Car, Package, Newspaper, Headphones, Database, FileText, ListTodo, Search, Bike, Dumbbell, UtensilsCrossed, FolderSync, BookOpen, Youtube, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { ConfidenceBar } from './ConfidenceBar';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getFrequencyLabel, KNOWN_SERVICES } from '@/lib/subscription-detector';
import { getServiceLogo } from '@/lib/service-logos';
import type { Subscription } from '@/types/subscription';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { differenceInDays } from 'date-fns';

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick?: () => void;
}

// Map icon names to actual icon components
const iconMap: Record<string, typeof Tv> = {
  Tv,
  Music,
  Bot,
  Cloud,
  Heart,
  Car,
  Package,
  Newspaper,
  Headphones,
  Database,
  FileText,
  ListTodo,
  Search,
  Bike,
  Dumbbell,
  UtensilsCrossed,
  FolderSync,
  BookOpen,
  Youtube,
  CreditCard,
};

function getServiceIcon(subscription: Subscription) {
  // Try to get icon from known service
  if (subscription.knownServiceId) {
    const service = KNOWN_SERVICES.find((s) => s.id === subscription.knownServiceId);
    if (service?.icon && iconMap[service.icon]) {
      return iconMap[service.icon];
    }
  }
  // Default to credit card icon
  return CreditCard;
}

// Calculate urgency level based on days until renewal
function getUrgencyLevel(nextDate: string | null | undefined, status: string): 'none' | 'low' | 'medium' | 'high' {
  if (status !== 'active' || !nextDate) return 'none';
  const daysUntil = differenceInDays(new Date(nextDate), new Date());
  if (daysUntil <= 3) return 'high';
  if (daysUntil <= 7) return 'medium';
  if (daysUntil <= 14) return 'low';
  return 'none';
}

const urgencyStyles = {
  none: '',
  low: 'border-l-4 border-l-success',
  medium: 'border-l-4 border-l-warning',
  high: 'border-l-4 border-l-destructive',
};

export function SubscriptionCard({ subscription, onClick }: SubscriptionCardProps) {
  const Icon = getServiceIcon(subscription);
  const frequencyLabel = getFrequencyLabel(subscription.frequency);
  const logoUrl = getServiceLogo(subscription.knownServiceId);
  const [logoError, setLogoError] = useState(false);
  const urgency = getUrgencyLevel(subscription.nextExpectedDate, subscription.status);

  return (
    <Card
      variant="elevated"
      className={cn(
        'overflow-hidden cursor-pointer',
        subscription.status === 'cancelled' && 'opacity-60',
        urgencyStyles[urgency]
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={subscription.name}
                  className="h-6 w-6 rounded object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Icon className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              )}
            </div>
            <span className="font-semibold truncate">{subscription.name}</span>
          </div>
          <SubscriptionStatusBadge status={subscription.status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-0 space-y-4">
        {/* Amount with frequency */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold">
            {formatCurrency(subscription.amount)}
          </span>
          <span className="text-sm text-muted-foreground">/{frequencyLabel}</span>
        </div>

        {/* Confidence bar */}
        <ConfidenceBar confidence={subscription.confidence} />

        {/* Next renewal */}
        {subscription.nextExpectedDate && subscription.status === 'active' && (
          <div className="flex items-center gap-2 text-sm pt-3 border-t">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Next: {formatDate(new Date(subscription.nextExpectedDate))}
            </span>
          </div>
        )}

        {/* Last charge for cancelled subscriptions */}
        {subscription.lastChargeDate && subscription.status === 'cancelled' && (
          <div className="flex items-center gap-2 text-sm pt-3 border-t">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Last: {formatDate(new Date(subscription.lastChargeDate))}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
