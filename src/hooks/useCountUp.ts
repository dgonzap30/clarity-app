import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  /** Starting value (default: 0) */
  start?: number;
  /** Target value to count up to */
  end: number;
  /** Animation duration in ms (default: 800) */
  duration?: number;
  /** Number of decimal places to show (default: 0) */
  decimals?: number;
  /** Whether to animate (default: true) */
  enabled?: boolean;
}

/**
 * useCountUp - Animated number counting hook
 *
 * Provides a smooth count-up animation from start to end value.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * const animatedValue = useCountUp({ end: 1234.56, decimals: 2 });
 * return <span>{animatedValue}</span>
 */
export function useCountUp({
  start = 0,
  end,
  duration = 800,
  decimals = 0,
  enabled = true,
}: UseCountUpOptions): string {
  const [value, setValue] = useState(enabled ? start : end);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip animation if disabled or reduced motion preferred
    if (!enabled || prefersReducedMotion) {
      setValue(end);
      return;
    }

    // Reset for new animation
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (end - start) * easeOut;

      setValue(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [start, end, duration, enabled]);

  // Format the value with the specified number of decimals
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}
