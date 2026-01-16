import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        // Default: Glass morphism card with subtle backdrop blur
        default: [
          "glass-card",
          "shadow-glass",
          "relative overflow-hidden",
        ],
        // Elevated: Glass card with enhanced shadow and glow
        elevated: [
          "glass-card",
          "shadow-glass-lg",
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:rounded-lg before:p-[1px]",
          "before:bg-gradient-to-br before:from-white/10 before:to-transparent",
          "before:-z-10",
        ],
        // Interactive: Clickable glass card with hover glow
        interactive: [
          "glass-card",
          "shadow-glass",
          "relative overflow-hidden",
          "hover:shadow-glass-lg",
          "hover:border-white/10",
          "cursor-pointer",
          "transition-all duration-300",
        ],
        // Hero: Premium glass card with gradient glow effect
        hero: [
          "glass-card",
          "shadow-glow-purple",
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:rounded-lg",
          "before:bg-gradient-to-br before:from-gradient-purple-from/5 before:to-transparent",
          "before:-z-10",
          "after:absolute after:top-0 after:left-0 after:right-0 after:h-px",
          "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
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
