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
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-white/10 bg-white/5 text-foreground backdrop-blur-sm hover:bg-white/10",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "text-foreground border-border bg-transparent hover:border-primary/50 hover:bg-primary/10",
        // Status variants with solid backgrounds for clarity
        success:
          "border-transparent bg-success text-white",
        warning:
          "border-transparent bg-warning text-white",
        danger:
          "border-transparent bg-destructive text-white",
        // Filter variant - clean active state
        filter:
          "border-border/50 text-foreground bg-white/5 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 cursor-pointer data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary data-[active=true]:shadow-sm",
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
