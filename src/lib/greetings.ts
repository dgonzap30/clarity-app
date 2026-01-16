// greetings.ts - Time-based greeting utilities

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Get the current time of day based on the hour
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get a random greeting based on time of day and optional user name
 */
export function getGreeting(userName?: string): string {
  const timeOfDay = getTimeOfDay();
  const name = userName?.trim();

  const greetings: Record<TimeOfDay, string[]> = {
    morning: [
      name ? `Good morning, ${name}!` : 'Good morning!',
      name ? `Rise and shine, ${name}!` : 'Rise and shine!',
      name ? `Morning, ${name}! Ready to conquer your finances?` : 'Morning! Ready to conquer your finances?',
      name ? `Hey ${name}, fresh start today!` : 'Fresh start today!',
    ],
    afternoon: [
      name ? `Good afternoon, ${name}!` : 'Good afternoon!',
      name ? `Hey ${name}, how's your day going?` : 'How\'s your day going?',
      name ? `Afternoon, ${name}! Time for a money check-in.` : 'Time for a money check-in!',
    ],
    evening: [
      name ? `Good evening, ${name}!` : 'Good evening!',
      name ? `Evening, ${name}! Winding down?` : 'Winding down?',
      name ? `Hey ${name}, reviewing your day?` : 'Reviewing your day?',
    ],
    night: [
      name ? `Hey ${name}, burning the midnight oil?` : 'Burning the midnight oil?',
      name ? `Night owl, ${name}?` : 'Night owl mode activated!',
      name ? `Late night finance check, ${name}?` : 'Late night finance check!',
    ],
  };

  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get a consistent greeting for the current session (doesn't change on re-render)
 * Cached for 30 minutes
 */
let cachedGreeting: { greeting: string; timestamp: number; userName?: string } | null = null;
const GREETING_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function getSessionGreeting(userName?: string): string {
  const now = Date.now();

  // If cache exists, is still valid, and user name matches
  if (
    cachedGreeting &&
    (now - cachedGreeting.timestamp) < GREETING_CACHE_DURATION &&
    cachedGreeting.userName === userName
  ) {
    return cachedGreeting.greeting;
  }

  // Generate new greeting
  const greeting = getGreeting(userName);
  cachedGreeting = { greeting, timestamp: now, userName };
  return greeting;
}

/**
 * Clear the cached greeting (useful for testing or forcing refresh)
 */
export function clearGreetingCache(): void {
  cachedGreeting = null;
}
