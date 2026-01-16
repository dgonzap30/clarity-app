import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Hero Card Skeleton */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left side - Total */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            {/* Right side - Split bars */}
            <div className="flex-1 max-w-md space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar Skeleton */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
              >
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two column grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-around gap-2">
              {[40, 65, 45, 80, 55, 70].map((h, i) => (
                <Skeleton
                  key={i}
                  className="w-12 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton for budget/category cards grid
export function CategoryCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Skeleton for transactions table
export function TransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header row */}
          <div className="flex items-center gap-4 p-3 border-b">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Data rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 border-b">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
