import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    "flex w-full rounded-lg text-sm transition-all duration-200",
    "bg-transparent",
    "placeholder:text-muted-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // File input styling
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "h-10 px-3 py-2",
          "border border-input",
          "shadow-sm",
          // Focus state with Aurora accent
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--aurora-teal)/0.5)] focus-visible:border-[hsl(var(--aurora-teal))]",
          // Hover state
          "hover:border-[hsl(var(--aurora-teal)/0.5)]",
        ].join(" "),
        filled: [
          "h-10 px-3 py-2",
          "bg-muted/50 border border-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--aurora-teal)/0.5)] focus-visible:bg-transparent focus-visible:border-[hsl(var(--aurora-teal))]",
          "hover:bg-muted/70",
        ].join(" "),
        ghost: [
          "h-10 px-3 py-2",
          "border border-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--aurora-teal)/0.5)] focus-visible:border-input",
          "hover:bg-muted/50",
        ].join(" "),
      },
      inputSize: {
        default: "h-10",
        sm: "h-8 px-2 text-xs rounded-md",
        lg: "h-12 px-4 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
