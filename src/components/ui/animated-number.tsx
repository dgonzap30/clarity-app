import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  /** Show pulse animation on value change */
  pulseOnChange?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 600,
  format = (v) => v.toLocaleString(),
  className,
  pulseOnChange = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isChanging, setIsChanging] = React.useState(false);
  const previousValue = React.useRef(0);
  const animationRef = React.useRef<number>(undefined);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    // Trigger pulse animation on value change (skip first render)
    if (pulseOnChange && !isFirstRender.current && startValue !== endValue) {
      setIsChanging(true);
      const pulseTimeout = setTimeout(() => setIsChanging(false), 300);
      return () => clearTimeout(pulseTimeout);
    }
    isFirstRender.current = false;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, pulseOnChange]);

  return (
    <span className={cn(
      "tabular-nums transition-transform",
      isChanging && "animate-number-change",
      className
    )}>
      {format(displayValue)}
    </span>
  );
}
