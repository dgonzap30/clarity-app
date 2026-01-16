import { useEffect, useRef } from 'react';

export interface SparkleEffectProps {
  /**
   * Trigger the sparkle effect when true
   */
  trigger?: boolean;
  /**
   * Number of sparkles to generate
   */
  count?: number;
  /**
   * Colors for the sparkles (aurora palette by default)
   */
  colors?: string[];
  /**
   * Duration of the effect in milliseconds
   */
  duration?: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

/**
 * SparkleEffect - Canvas-based sparkle animation for celebrations
 *
 * Creates a burst of animated sparkles/stars. Works alongside confetti
 * for more magical celebration moments.
 *
 * @example
 * ```tsx
 * <SparkleEffect
 *   trigger={isUnderBudget}
 *   count={50}
 *   colors={['#06D6A0', '#118AB2', '#7B2CBF']}
 * />
 * ```
 */
export function SparkleEffect({
  trigger = false,
  count = 50,
  colors = ['#06D6A0', '#118AB2', '#7B2CBF', '#FFD166', '#EF476F'],
  duration = 2000,
}: SparkleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const sparklesRef = useRef<Sparkle[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create sparkles
    sparklesRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - Math.random() * 2, // Slight upward bias
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: duration + Math.random() * 500,
      };
    });

    startTimeRef.current = Date.now();

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > duration + 500) {
        // Animation complete
        sparklesRef.current = [];
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current.forEach((sparkle) => {
        // Update position
        sparkle.x += sparkle.velocity.x;
        sparkle.y += sparkle.velocity.y;
        sparkle.velocity.y += 0.1; // Gravity
        sparkle.rotation += sparkle.rotationSpeed;

        // Update life
        sparkle.life = Math.max(0, 1 - elapsed / sparkle.maxLife);

        if (sparkle.life <= 0) {
          return;
        }

        // Draw sparkle as a 4-pointed star
        ctx.save();
        ctx.translate(sparkle.x, sparkle.y);
        ctx.rotate((sparkle.rotation * Math.PI) / 180);
        ctx.globalAlpha = sparkle.life;

        // Draw star shape
        ctx.fillStyle = sparkle.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const x = Math.cos(angle) * sparkle.size;
          const y = Math.sin(angle) * sparkle.size;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          // Add inner points for star shape
          const innerAngle = angle + Math.PI / 4;
          const innerX = Math.cos(innerAngle) * (sparkle.size * 0.4);
          const innerY = Math.sin(innerAngle) * (sparkle.size * 0.4);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      if (sparklesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trigger, count, colors, duration]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
