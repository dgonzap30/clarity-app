import { cn } from '@/lib/utils';

export interface AuroraLogoProps {
  /**
   * Logo size: sm (32px), md (40px), lg (48px)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Enable animated aurora effect
   */
  animated?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * AuroraLogo - Elegant Northern Lights inspired logo
 *
 * Features flowing aurora waves rising from a horizon line,
 * creating a distinctive and memorable brand mark.
 */
export function AuroraLogo({
  size = 'md',
  animated = true,
  className,
}: AuroraLogoProps) {
  const sizeConfig = {
    sm: { container: 'h-8 w-8', scale: 0.8 },
    md: { container: 'h-10 w-10', scale: 1 },
    lg: { container: 'h-12 w-12', scale: 1.2 },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
        'ring-1 ring-white/10',
        'shadow-lg shadow-black/20',
        config.container,
        className
      )}
    >
      {/* Stars/particles background */}
      <div className="absolute inset-0">
        <div className="absolute top-[15%] left-[20%] w-0.5 h-0.5 bg-white/60 rounded-full" />
        <div className="absolute top-[25%] right-[25%] w-0.5 h-0.5 bg-white/40 rounded-full" />
        <div className="absolute top-[35%] left-[60%] w-0.5 h-0.5 bg-white/50 rounded-full" />
      </div>

      {/* Aurora waves container */}
      <div className={cn('absolute inset-0', animated && 'animate-aurora-flow')}>
        {/* Primary aurora wave - Teal */}
        <div
          className="absolute bottom-[30%] left-0 right-0 h-[45%]"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 30% 100%,
                hsl(var(--aurora-income) / 0.8) 0%,
                hsl(var(--aurora-income) / 0.4) 30%,
                transparent 70%)
            `,
            filter: 'blur(1px)',
          }}
        />

        {/* Secondary aurora wave - Blue */}
        <div
          className={cn('absolute bottom-[35%] left-0 right-0 h-[40%]', animated && 'animate-wave-drift')}
          style={{
            background: `
              radial-gradient(ellipse 70% 45% at 60% 100%,
                hsl(var(--aurora-insight) / 0.7) 0%,
                hsl(var(--aurora-insight) / 0.3) 40%,
                transparent 70%)
            `,
            filter: 'blur(1.5px)',
          }}
        />

        {/* Tertiary aurora wave - Purple */}
        <div
          className={cn('absolute bottom-[40%] left-0 right-0 h-[35%]', animated && 'animate-wave-drift-slow')}
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 45% 100%,
                hsl(var(--aurora-purple) / 0.6) 0%,
                hsl(var(--aurora-purple) / 0.2) 50%,
                transparent 75%)
            `,
            filter: 'blur(2px)',
          }}
        />

        {/* Accent highlight - top glow */}
        <div
          className="absolute top-[20%] left-[20%] right-[20%] h-[25%]"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 100%,
                hsl(var(--aurora-income) / 0.3) 0%,
                transparent 60%)
            `,
            filter: 'blur(3px)',
          }}
        />
      </div>

      {/* Horizon line */}
      <div
        className="absolute bottom-[28%] left-[10%] right-[10%] h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--aurora-income) / 0.6) 30%, hsl(var(--aurora-insight) / 0.6) 70%, transparent 100%)',
          boxShadow: '0 0 8px hsl(var(--aurora-income) / 0.4), 0 0 16px hsl(var(--aurora-insight) / 0.2)',
        }}
      />

      {/* Central bright point */}
      <div
        className={cn(
          'absolute bottom-[28%] left-1/2 -translate-x-1/2 translate-y-1/2',
          'w-1.5 h-1.5 rounded-full',
          'bg-white',
          animated && 'animate-pulse-glow'
        )}
        style={{
          boxShadow: `
            0 0 4px white,
            0 0 8px hsl(var(--aurora-income)),
            0 0 16px hsl(var(--aurora-income) / 0.5)
          `,
        }}
      />

      {/* Reflection on "water" */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[28%]"
        style={{
          background: 'linear-gradient(to top, hsl(var(--aurora-income) / 0.15) 0%, transparent 100%)',
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 40%, transparent 30%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
}
