import React from 'react';
import { cn } from '@/lib/utils';

export interface AuroraBackgroundProps {
  /**
   * Visual intensity variant
   * - subtle: Very gentle gradient mesh (default)
   * - vivid: Bold 4-color aurora gradient
   * - mesh: Full gradient mesh with multiple radial gradients
   */
  variant?: 'subtle' | 'vivid' | 'mesh';
  /**
   * Enable slow animation for the gradient (30s loop)
   */
  animated?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Child elements to render on top of the background
   */
  children?: React.ReactNode;
}

/**
 * AuroraBackground - Animated gradient mesh background for hero cards
 *
 * Creates a Northern Lights inspired background effect with support for different
 * intensity levels and animation. Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * ```tsx
 * <AuroraBackground variant="mesh" animated>
 *   <CardContent>Your content here</CardContent>
 * </AuroraBackground>
 * ```
 */
export function AuroraBackground({
  variant = 'subtle',
  animated = false,
  className,
  children,
}: AuroraBackgroundProps) {
  const variantClasses = {
    subtle: 'bg-aurora-gradient-subtle',
    vivid: 'bg-gradient-aurora-vivid',
    mesh: 'bg-aurora-mesh',
  };

  return (
    <div className="relative">
      {/* Aurora gradient background layer */}
      <div
        className={cn(
          'absolute inset-0 -z-10 rounded-2xl',
          variantClasses[variant],
          animated && 'aurora-bg-animated',
          className
        )}
        aria-hidden="true"
      />
      {/* Content layer */}
      {children}
    </div>
  );
}
