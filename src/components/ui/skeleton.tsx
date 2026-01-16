import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text" | "card";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        {
          "rounded-md": variant === "default",
          "rounded-full": variant === "circular",
          "rounded h-4": variant === "text",
          "rounded-2xl": variant === "card",
        },
        className
      )}
      {...props}
    />
  )
}

// Pre-built skeleton components for common patterns
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6" variant="circular" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function SkeletonProgressBar({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
    </div>
  );
}

function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === 0 ? "w-24" : "flex-1")} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonProgressBar, SkeletonTableRow }
