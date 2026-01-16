import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Search,
  FileSpreadsheet,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

type EmptyStateVariant = 'no-data' | 'no-results' | 'no-transactions' | 'error';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: LucideIcon; title: string; description: string }
> = {
  'no-data': {
    icon: Upload,
    title: 'Your financial story starts here',
    description: 'Upload a CSV file and take the first step toward financial clarity.',
  },
  'no-results': {
    icon: Search,
    title: 'No matches found',
    description: 'Try adjusting your filters to discover more insights.',
  },
  'no-transactions': {
    icon: Wallet,
    title: 'A fresh start this month',
    description: 'No transactions yet — your budget is ready and waiting for you!',
  },
  error: {
    icon: FileSpreadsheet,
    title: 'Oops! A small hiccup',
    description: "We couldn't load your data this time. Let's try again!",
  },
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className={cn(
        "rounded-full p-4 mb-4",
        "bg-gradient-to-br from-[hsl(var(--aurora-teal)/0.1)] to-[hsl(var(--aurora-blue)/0.1)]",
        "border border-[hsl(var(--aurora-teal)/0.2)]",
        "shadow-[0_0_20px_hsl(var(--aurora-teal)/0.1)]"
      )}>
        <Icon className="h-8 w-8 text-[hsl(var(--aurora-teal))]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function EmptyStateCompact({
  variant = 'no-data',
  title,
  description,
  icon,
  className,
}: Omit<EmptyStateProps, 'action'>) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 text-center',
        className
      )}
    >
      <div className={cn(
        "rounded-full p-3 mb-3",
        "bg-gradient-to-br from-[hsl(var(--aurora-teal)/0.1)] to-[hsl(var(--aurora-blue)/0.1)]",
        "border border-[hsl(var(--aurora-teal)/0.2)]"
      )}>
        <Icon className="h-5 w-5 text-[hsl(var(--aurora-teal))]" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium mb-1">{displayTitle}</p>
      <p className="text-xs text-muted-foreground">{displayDescription}</p>
    </div>
  );
}
