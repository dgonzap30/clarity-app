import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AddSubscriptionCardProps {
  onClick?: () => void;
}

export function AddSubscriptionCard({ onClick }: AddSubscriptionCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer',
        'border-2 border-dashed border-muted-foreground/30',
        'hover:border-[hsl(var(--accent-green))] hover:bg-muted/50',
        'transition-all duration-200',
        'flex items-center justify-center'
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm">Add Subscription</p>
          <p className="text-xs text-muted-foreground mt-1">
            Track a new recurring expense
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
