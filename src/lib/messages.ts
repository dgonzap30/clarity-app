// messages.ts - Fun, contextual status messages for the Aurora Finance dashboard

/**
 * Helper to pick a random item from an array
 */
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// ============================================================================
// Budget Status Messages
// ============================================================================

export interface BudgetStatusInfo {
  percentUsed: number;
  remaining: number;
  daysRemaining: number;
  isOnPace: boolean;
}

export interface StatusMessage {
  text: string;
  emoji?: string;
}

/**
 * Get a fun, contextual budget status message based on current state
 */
export function getBudgetStatusMessage(info: BudgetStatusInfo): StatusMessage {
  const { percentUsed, daysRemaining, isOnPace } = info;

  // Over budget (100%+)
  if (percentUsed >= 100) {
    return pickRandom([
      { text: "Budget's been conquered!" },
      { text: "Over the finish line!" },
      { text: "Time for budget recovery mode" },
      { text: "Let's reset next month!" },
      { text: "Overspent, but awareness is step one" },
    ]);
  }

  // Warning zone (80-99%)
  if (percentUsed >= 80) {
    return pickRandom([
      { text: "Watch It! Budget's getting tight" },
      { text: "Caution zone ahead!" },
      { text: "Almost there... tread carefully!" },
      { text: "Budget Alert!" },
      { text: "Time to slow down spending" },
    ]);
  }

  // Moderate but not on pace (50-79%)
  if (percentUsed >= 50 && !isOnPace) {
    return pickRandom([
      { text: "Spending a bit fast!" },
      { text: "Pace yourself, champ!" },
      { text: `${daysRemaining} days to adjust` },
      { text: "Getting close, stay sharp!" },
    ]);
  }

  // Doing well (30-79%)
  if (percentUsed >= 30) {
    return pickRandom([
      { text: "You're Crushing It!" },
      { text: "Smooth Sailing!" },
      { text: "Budget game strong!" },
      { text: "Financial ninja mode!" },
      { text: "Looking Good!" },
      { text: "Keep this up!" },
      { text: "Nailing it!" },
    ]);
  }

  // Excellent (<30%)
  return pickRandom([
    { text: "Budget boss level unlocked!" },
    { text: "Impressively disciplined!" },
    { text: "Financial superhero status!" },
    { text: "Your wallet thanks you!" },
    { text: "Money management mastery!" },
    { text: "Perfect Start!" },
  ]);
}

// ============================================================================
// Spending Trend Messages
// ============================================================================

export interface TrendInfo {
  percentChange: number;
  isIncrease: boolean;
  previousAmount: number;
  currentAmount: number;
}

/**
 * Get a message about spending trend compared to last month
 */
export function getSpendingTrendMessage(info: TrendInfo): string {
  const { percentChange, isIncrease, previousAmount } = info;
  const absChange = Math.abs(percentChange);

  if (previousAmount === 0) {
    return "First month tracked!";
  }

  if (isIncrease) {
    if (absChange > 50) {
      return "Big jump this month! Worth investigating";
    } else if (absChange > 25) {
      return "Noticeable uptick in spending";
    } else if (absChange > 10) {
      return "Slight increase, nothing alarming";
    } else {
      return "Pretty consistent with last month";
    }
  } else {
    if (absChange > 50) {
      return "Incredible savings! What changed?";
    } else if (absChange > 25) {
      return "Great progress cutting expenses!";
    } else if (absChange > 10) {
      return "Nice reduction, keep it up!";
    } else {
      return "Steady as she goes";
    }
  }
}

// ============================================================================
// Category-Specific Messages
// ============================================================================

/**
 * Get a fun message based on category and spending level
 */
export function getCategoryMessage(
  categoryId: string,
  percentUsed: number
): string {
  const categoryMessages: Record<string, { low: string[]; mid: string[]; high: string[] }> = {
    'nightlife': {
      low: ['Party funds mostly intact!', 'Saving the night scene for later?'],
      mid: ['Balanced social life achieved', 'Fun times, reasonable spending'],
      high: ['Living your best life!', 'The night owl budget stretches thin'],
    },
    'personal': {
      low: ['Minimalist vibes this month', 'Personal spending in check'],
      mid: ['Treating yourself responsibly', 'Self-care budget on track'],
      high: ['Investing in yourself! (Maybe slow down)'],
    },
    'entertainment': {
      low: ['Quiet entertainment month', 'Saving up for something big?'],
      mid: ['Good balance of fun and frugality', 'Entertainment budget well managed'],
      high: ['Living for the experience!', 'Entertainment enthusiast mode'],
    },
    'transportation': {
      low: ['Walking more? Saving the planet!', 'Transport costs minimal'],
      mid: ['Getting around efficiently', 'Transportation budget steady'],
      high: ['On the move a lot this month!'],
    },
    'health-sports': {
      low: ['Health is wealth (and free workouts count!)'],
      mid: ['Investing in wellbeing!', 'Health spending on track'],
      high: ['Serious fitness goals!'],
    },
    'school-housing': {
      low: ['Housing costs under control'],
      mid: ['Steady housing expenses'],
      high: ['Major housing investment this month'],
    },
    'work-ai': {
      low: ['Lean work spending'],
      mid: ['Work tools budget balanced'],
      high: ['Investing in productivity tools!'],
    },
  };

  const defaultMessages = {
    low: ['Well under control', 'Minimal spending here'],
    mid: ['Balanced spending', 'Right on track'],
    high: ['Keep an eye on this one', 'Higher than usual'],
  };

  const messages = categoryMessages[categoryId] || defaultMessages;

  if (percentUsed < 33) {
    return pickRandom(messages.low);
  } else if (percentUsed < 66) {
    return pickRandom(messages.mid);
  } else {
    return pickRandom(messages.high);
  }
}

// ============================================================================
// Empty State Messages
// ============================================================================

export const emptyStateMessages = {
  'no-data': {
    titles: [
      'Your financial story starts here',
      'Ready to take control?',
      'Begin your money journey',
    ],
    descriptions: [
      'Upload a CSV file and take the first step toward financial clarity.',
      'Import your transactions to unlock powerful insights.',
      'Your personalized finance dashboard awaits.',
    ],
  },
  'no-transactions': {
    titles: [
      'A fresh start this month',
      'Clean slate!',
      'Zero transactions recorded',
    ],
    descriptions: [
      'No transactions yet. Your budget is ready and waiting!',
      'Nothing spent yet this month. Perfect discipline!',
      'Upload transactions or enjoy your spending-free moment.',
    ],
  },
  'no-results': {
    titles: [
      'No matches found',
      'Nothing here',
      'Empty search results',
    ],
    descriptions: [
      'Try adjusting your filters to discover more.',
      'No transactions match these criteria.',
      'Broaden your search to find what you\'re looking for.',
    ],
  },
};

/**
 * Get a random empty state message
 */
export function getRandomEmptyStateMessage(variant: keyof typeof emptyStateMessages): {
  title: string;
  description: string;
} {
  const messages = emptyStateMessages[variant];
  const titleIndex = Math.floor(Math.random() * messages.titles.length);
  const descIndex = Math.floor(Math.random() * messages.descriptions.length);
  return {
    title: messages.titles[titleIndex],
    description: messages.descriptions[descIndex],
  };
}

// ============================================================================
// Achievement Messages
// ============================================================================

export type AchievementType =
  | 'first_month_under_budget'
  | 'streak_under_budget'
  | 'biggest_savings'
  | 'zero_spending_day'
  | 'category_eliminated';

export interface Achievement {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
}

/**
 * Get achievements based on spending data
 */
export function getAchievements(data: {
  consecutiveMonthsUnderBudget: number;
  savingsThisMonth: number;
  categoryWithZeroSpending?: string;
  zeroDaysThisMonth: number;
}): Achievement[] {
  const achievements: Achievement[] = [];

  if (data.consecutiveMonthsUnderBudget === 1) {
    achievements.push({
      type: 'first_month_under_budget',
      title: 'Budget Keeper',
      description: 'First month staying under budget!',
      icon: 'Trophy',
    });
  }

  if (data.consecutiveMonthsUnderBudget >= 3) {
    achievements.push({
      type: 'streak_under_budget',
      title: `${data.consecutiveMonthsUnderBudget}-Month Streak!`,
      description: `${data.consecutiveMonthsUnderBudget} months under budget in a row`,
      icon: 'Flame',
    });
  }

  if (data.savingsThisMonth > 5000) {
    achievements.push({
      type: 'biggest_savings',
      title: 'Super Saver',
      description: `Saved over $${data.savingsThisMonth.toLocaleString()} this month!`,
      icon: 'PiggyBank',
    });
  }

  if (data.zeroDaysThisMonth >= 5) {
    achievements.push({
      type: 'zero_spending_day',
      title: 'No-Spend Champion',
      description: `${data.zeroDaysThisMonth} zero-spending days this month`,
      icon: 'Shield',
    });
  }

  return achievements;
}
