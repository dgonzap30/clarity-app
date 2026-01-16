import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AddCategoryCardProps {
  onClick?: () => void;
}

export function AddCategoryCard({ onClick }: AddCategoryCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer flex flex-col h-full',
        'border-2 border-dashed border-muted-foreground/30',
        'hover:border-[hsl(var(--accent-green))] hover:bg-muted/50',
        'transition-all duration-200'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center gap-3 h-full text-center">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm">Add Category</p>
          <p className="text-xs text-muted-foreground mt-1">
            Track a new expense type
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
