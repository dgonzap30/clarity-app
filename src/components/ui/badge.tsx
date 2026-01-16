import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 hover:shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:border-border",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline:
          "text-foreground border-border hover:border-primary hover:bg-primary/5",
        // Status variants with tinted backgrounds
        success:
          "border-transparent bg-success-light text-success hover:bg-success-light/80",
        warning:
          "border-transparent bg-warning-light text-warning-foreground hover:bg-warning-light/80",
        danger:
          "border-transparent bg-destructive-light text-destructive hover:bg-destructive-light/80",
        // Filter variant for toggle-able filter chips
        filter:
          "border-border text-foreground bg-transparent hover:border-primary hover:bg-primary/5 hover:scale-[1.02] cursor-pointer data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary data-[active=true]:shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  active?: boolean;
}

function Badge({ className, variant, active, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      data-active={active}
      {...props}
    />
  )
}

// Status icons for accessibility (colorblind support)
const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
  default: Info,
} as const;

type StatusType = keyof typeof statusIcons;

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status?: StatusType;
  showIcon?: boolean;
  children: React.ReactNode;
}

/**
 * StatusBadge - A badge component with icons for colorblind accessibility
 * Displays an icon alongside text to indicate status without relying solely on color
 */
function StatusBadge({
  status = 'default',
  showIcon = true,
  children,
  className,
  ...props
}: StatusBadgeProps) {
  const Icon = statusIcons[status];
  const variant = status === 'default' ? 'secondary' : status;

  return (
    <Badge variant={variant} className={cn("gap-1", className)} {...props}>
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
      <span className="sr-only">({status} status)</span>
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants }
