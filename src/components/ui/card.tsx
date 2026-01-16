import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        // Default: Clean, minimal card
        default: [
          "bg-card",
          "border border-border",
        ],
        // Elevated: Card with subtle shadow
        elevated: [
          "bg-card",
          "border border-border",
          "shadow-sm",
        ],
        // Interactive: Clickable card with hover states
        interactive: [
          "bg-card",
          "border border-border",
          "hover:border-foreground/20",
          "hover:shadow-sm",
          "cursor-pointer",
        ],
        // Hero: Elevated card with gradient background for emphasis
        hero: [
          "bg-gradient-to-br from-card to-muted/30",
          "border-2 border-border",
          "shadow-sm",
          "ring-1 ring-inset ring-white/5 dark:ring-white/10",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
}

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  CardTitleProps
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
