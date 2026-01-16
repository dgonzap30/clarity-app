import { getSessionGreeting, getTimeOfDay } from '@/lib/greetings';
import { cn } from '@/lib/utils';

export interface PersonalizedGreetingProps {
  /**
   * User's name for personalization
   */
  userName?: string;
  /**
   * Budget status for contextual messaging
   */
  budgetStatus?: 'on-track' | 'warning' | 'over-budget';
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PersonalizedGreeting - Time-aware greeting with fun status messages
 *
 * Displays a greeting based on time of day and optional user name.
 * Includes an animated wave emoji and optional budget status indicator.
 *
 * @example
 * ```tsx
 * <PersonalizedGreeting
 *   userName="David"
 *   budgetStatus="on-track"
 * />
 * ```
 */
export function PersonalizedGreeting({
  userName,
  budgetStatus,
  className,
}: PersonalizedGreetingProps) {
  const greeting = getSessionGreeting(userName);
  const timeOfDay = getTimeOfDay();

  // Get emoji based on time of day
  const getTimeEmoji = () => {
    switch (timeOfDay) {
      case 'morning':
        return '☀️';
      case 'afternoon':
        return '🌤️';
      case 'evening':
        return '🌆';
      case 'night':
        return '🌙';
      default:
        return '👋';
    }
  };

  // Get status indicator text
  const getStatusIndicator = () => {
    if (!budgetStatus) return null;

    const indicators = {
      'on-track': { text: 'Looking good', color: 'text-success' },
      'warning': { text: 'Watch it', color: 'text-warning' },
      'over-budget': { text: 'Budget alert', color: 'text-destructive' },
    };

    return indicators[budgetStatus];
  };

  const statusIndicator = getStatusIndicator();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="animate-pulse text-xl" aria-hidden="true">
        {getTimeEmoji()}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {greeting}
        </span>
        {statusIndicator && (
          <span className={cn('text-xs', statusIndicator.color)}>
            {statusIndicator.text}
          </span>
        )}
      </div>
    </div>
  );
}
