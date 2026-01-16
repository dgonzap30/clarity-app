import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
      "relative h-2 w-full grow overflow-hidden rounded-full",
      "bg-[hsl(var(--aurora-teal)/0.15)]",
      "shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
    )}>
      <SliderPrimitive.Range className={cn(
        "absolute h-full",
        "bg-gradient-to-r from-[hsl(var(--aurora-teal))] to-[hsl(var(--aurora-blue))]",
        "shadow-[0_0_8px_hsl(var(--aurora-teal)/0.4)]"
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(
      "block h-5 w-5 rounded-full",
      "bg-white dark:bg-card",
      "border-2 border-[hsl(var(--aurora-teal))]",
      "shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
      "transition-all duration-200",
      "hover:scale-110 hover:border-[hsl(var(--aurora-blue))]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--aurora-teal)/0.5)] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-95"
    )} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
