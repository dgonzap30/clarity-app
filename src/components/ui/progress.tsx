import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "h-full w-full flex-1 rounded-full transition-all origin-left relative",
  {
    variants: {
      status: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        danger: "bg-destructive",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  /** Automatically select color based on value: ≥90% = danger, ≥70% = warning, else = success */
  dynamicColor?: boolean;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, status, dynamicColor = false, 'aria-label': ariaLabel, ...props }, ref) => {
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Calculate dynamic status based on value
  const computedStatus = React.useMemo(() => {
    if (status) return status;
    if (!dynamicColor) return 'default';
    const numValue = value ?? 0;
    if (numValue >= 90) return 'danger';
    if (numValue >= 70) return 'warning';
    return 'success';
  }, [value, status, dynamicColor]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value ?? 0}
      aria-label={ariaLabel}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        "bg-white/5 backdrop-blur-sm border border-white/10",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          progressVariants({ status: computedStatus })
        )}
        style={{
          width: hasAnimated ? `${value || 0}%` : '0%',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
