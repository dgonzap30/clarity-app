import { cn } from "@/lib/utils"

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeMap[size], className)}
      aria-label="Clarity logo"
    >
      {/* Simple "C" mark */}
      <path
        d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c3.314 0 6.314-1.343 8.485-3.515"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="16"
        cy="16"
        r="4"
        fill="currentColor"
      />
    </svg>
  )
}
