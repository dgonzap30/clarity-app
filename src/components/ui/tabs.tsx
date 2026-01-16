import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  'aria-label'?: string;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, 'aria-label': ariaLabel = 'Dashboard navigation', ...props }, ref) => (
  <nav aria-label={ariaLabel}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center gap-8",
        "border-b border-border",
        "w-full",
        className
      )}
      {...props}
    />
  </nav>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap",
      "text-sm font-medium",
      "px-0 py-3",
      "border-b-2 border-transparent",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      // Inactive state
      "text-muted-foreground",
      // Active state
      "data-[state=active]:text-foreground",
      "data-[state=active]:border-primary",
      "data-[state=active]:bg-primary/5",
      "data-[state=active]:font-semibold",
      // Hover state for inactive tabs
      "data-[state=inactive]:hover:text-foreground",
      "data-[state=inactive]:hover:bg-muted/50",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "animate-fade-in",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
