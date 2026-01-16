import type { Transaction, CategoryId } from '@/types';
import type {
  KnownService,
  Subscription,
  RecurringPattern,
  UpcomingRenewal,
  BillingFrequency,
  SubscriptionSettings,
} from '@/types/subscription';

/**
 * Built-in known subscription services
 */
export const KNOWN_SERVICES: KnownService[] = [
  // Streaming & Entertainment
  {
    id: 'netflix',
    name: 'Netflix',
    patterns: [/NETFLIX/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Tv',
    website: 'netflix.com',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    patterns: [/SPOTIFY/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Music',
    website: 'spotify.com',
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    patterns: [/DISNEY PLUS/i, /DISNEY\+/i, /DISNEYPLUS/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Tv',
  },
  {
    id: 'hbo-max',
    name: 'HBO Max',
    patterns: [/HBOMAX/i, /HBO MAX/i, /HBO/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Tv',
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    patterns: [/YOUTUBE PREMIUM/i, /GOOGLE\*YOUTUBE/i, /YOUTUBE TV/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Youtube',
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    patterns: [/AMAZONPRIME/i, /PRIME VIDEO/i, /AMAZON PRIME/i],
    defaultFrequency: 'annual',
    defaultCategoryId: 'entertainment',
    icon: 'Package',
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    patterns: [/PARAMNTPLUS/i, /PARAMOUNT\+/i, /PARAMOUNT PLUS/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Tv',
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    patterns: [/APPLE TV/i, /APPLE\.COM.*TV/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Apple',
  },
  {
    id: 'peacock',
    name: 'Peacock',
    patterns: [/PEACOCK/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Tv',
  },

  // AI & Work Tools
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    patterns: [/CHATGPT/i, /OPENAI/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'Bot',
    website: 'chat.openai.com',
  },
  {
    id: 'claude-ai',
    name: 'Claude Pro',
    patterns: [/CLAUDE\.AI/i, /ANTHROPIC/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'Bot',
    website: 'claude.ai',
  },
  {
    id: 'perplexity',
    name: 'Perplexity Pro',
    patterns: [/PERPLEXITY/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'Search',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    patterns: [/GITHUB/i, /COPILOT/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'Github',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    patterns: [/VERCEL/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'Cloud',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    patterns: [/SUPABASE/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'Database',
  },
  {
    id: 'notion',
    name: 'Notion',
    patterns: [/NOTION/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'FileText',
  },
  {
    id: 'linear',
    name: 'Linear',
    patterns: [/LINEAR/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'work-ai',
    icon: 'ListTodo',
  },

  // Cloud Storage
  {
    id: 'google-one',
    name: 'Google One',
    patterns: [/GOOGLE ONE/i, /GOOGLE\*GOOGLE ONE/i, /GOOGLE\*DRIVE/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'personal',
    icon: 'Cloud',
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    patterns: [/APPLE\.COM.*BILL/i, /ICLOUD/i, /APPLE\.COM\/BILL/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'personal',
    icon: 'Cloud',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    patterns: [/DROPBOX/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'personal',
    icon: 'FolderSync',
  },

  // Health & Fitness
  {
    id: 'whoop',
    name: 'WHOOP',
    patterns: [/WHOOP/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'health-sports',
    icon: 'Heart',
  },
  {
    id: 'strava',
    name: 'Strava',
    patterns: [/STRAVA/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'health-sports',
    icon: 'Bike',
  },
  {
    id: 'peloton',
    name: 'Peloton',
    patterns: [/PELOTON/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'health-sports',
    icon: 'Dumbbell',
  },

  // Food & Delivery
  {
    id: 'doordash',
    name: 'DoorDash DashPass',
    patterns: [/DOORDASH.*DASHPASS/i, /DASHPASS/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'personal',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'uber-one',
    name: 'Uber One',
    patterns: [/UBER ONE/i, /UBER\*ONE/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'transportation',
    icon: 'Car',
  },

  // Music & Audio
  {
    id: 'apple-music',
    name: 'Apple Music',
    patterns: [/APPLE MUSIC/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Music',
  },
  {
    id: 'audible',
    name: 'Audible',
    patterns: [/AUDIBLE/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Headphones',
  },
  {
    id: 'splice',
    name: 'Splice',
    patterns: [/SPLICE/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Music',
  },

  // News & Reading
  {
    id: 'nyt',
    name: 'New York Times',
    patterns: [/NYT/i, /NEW YORK TIMES/i, /NYTIMES/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'Newspaper',
  },
  {
    id: 'medium',
    name: 'Medium',
    patterns: [/MEDIUM\.COM/i, /MEDIUM MEMBERSHIP/i],
    defaultFrequency: 'monthly',
    defaultCategoryId: 'entertainment',
    icon: 'BookOpen',
  },
];

/**
 * Detect known subscription services in transactions
 */
export function detectKnownServices(
  transactions: Transaction[],
  existingSubscriptions: Subscription[],
  ignoredPatterns: string[]
): Subscription[] {
  const detected: Subscription[] = [];
  const existingServiceIds = new Set(
    existingSubscriptions.filter((s) => s.knownServiceId).map((s) => s.knownServiceId)
  );

  for (const service of KNOWN_SERVICES) {
    // Skip already tracked services
    if (existingServiceIds.has(service.id)) continue;

    // Find matching transactions
    const matchingTxns = transactions.filter((t) =>
      service.patterns.some((pattern) => {
        if (typeof pattern === 'string') {
          return t.merchant.toUpperCase().includes(pattern.toUpperCase());
        }
        return pattern.test(t.merchant);
      })
    );

    if (matchingTxns.length === 0) continue;

    // Check if pattern is ignored
    const merchantPattern = extractCommonPattern(matchingTxns);
    if (ignoredPatterns.includes(merchantPattern.toUpperCase())) continue;

    // Calculate statistics
    const amounts = matchingTxns.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountStdDev = calculateStdDev(amounts);

    // Sort by date to find last charge
    const sortedByDate = [...matchingTxns].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastCharge = sortedByDate[0];

    // Estimate next billing date
    const nextExpected = estimateNextBillingDate(sortedByDate, service.defaultFrequency);

    detected.push({
      id: `sub-${service.id}-${Date.now()}`,
      name: service.name,
      merchantPattern,
      knownServiceId: service.id,
      frequency: service.defaultFrequency,
      amount: avgAmount,
      amountVariance: amountStdDev,
      currency: 'MXN',
      expectedBillingDay: lastCharge.date.getDate(),
      nextExpectedDate: nextExpected?.toISOString(),
      lastChargeDate: lastCharge.date.toISOString(),
      status: 'active',
      detectionMethod: 'known-service',
      confidence: 0.95, // High confidence for known services
      categoryId: service.defaultCategoryId,
      notifyBeforeRenewal: true,
      notifyDaysBefore: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactionIds: matchingTxns.map((t) => t.id),
    });
  }

  return detected;
}

/**
 * Analyze transactions to detect recurring patterns (unknown subscriptions)
 */
export function analyzeRecurringPatterns(
  transactions: Transaction[],
  settings: SubscriptionSettings
): RecurringPattern[] {
  const { minimumOccurrences, confidenceThreshold } = settings;

  // Group transactions by normalized merchant
  const merchantGroups = groupByMerchant(transactions);

  const patterns: RecurringPattern[] = [];

  for (const [merchant, txns] of Object.entries(merchantGroups)) {
    // Skip if too few occurrences
    if (txns.length < minimumOccurrences) continue;

    // Skip if already a known service
    if (isKnownService(merchant)) continue;

    // Analyze amount consistency
    const amounts = txns.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountStdDev = calculateStdDev(amounts);
    const amountCV = avgAmount > 0 ? amountStdDev / avgAmount : 0; // Coefficient of variation

    // Skip if amounts vary too much (> 30% CV)
    if (amountCV > 0.3) continue;

    // Analyze timing consistency
    const sortedTxns = [...txns].sort((a, b) => a.date.getTime() - b.date.getTime());
    const intervals = calculateIntervals(sortedTxns);

    if (intervals.length === 0) continue;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const intervalStdDev = calculateStdDev(intervals);

    // Determine frequency based on average interval
    const frequency = classifyFrequency(avgInterval, intervalStdDev);
    const frequencyConfidence = calculateFrequencyConfidence(intervals, frequency);

    // Skip if confidence too low
    if (frequencyConfidence < confidenceThreshold) continue;

    // Find most common day of month
    const dayOfMonthMode = findMode(txns.map((t) => t.date.getDate()));

    patterns.push({
      merchantPattern: merchant,
      transactions: txns.map((t) => t.id),
      averageAmount: avgAmount,
      amountStdDev,
      frequency,
      frequencyConfidence,
      dayOfMonthMode,
      intervalDays: avgInterval,
      intervalStdDev,
      firstDate: sortedTxns[0].date.toISOString(),
      lastDate: sortedTxns[sortedTxns.length - 1].date.toISOString(),
      occurrenceCount: txns.length,
    });
  }

  // Sort by confidence
  return patterns.sort((a, b) => b.frequencyConfidence - a.frequencyConfidence);
}

/**
 * Calculate upcoming renewals for the next N days
 */
export function getUpcomingRenewals(
  subscriptions: Subscription[],
  daysAhead: number = 30
): UpcomingRenewal[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const renewals: UpcomingRenewal[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== 'active') continue;
    if (!sub.nextExpectedDate) continue;

    const nextDate = new Date(sub.nextExpectedDate);
    if (nextDate < now || nextDate > cutoff) continue;

    const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    renewals.push({
      subscriptionId: sub.id,
      subscriptionName: sub.name,
      expectedDate: sub.nextExpectedDate,
      expectedAmount: sub.amount,
      daysUntil,
      categoryId: sub.categoryId,
    });
  }

  return renewals.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Update next expected date after a charge is detected
 */
export function updateNextExpectedDate(subscription: Subscription, chargeDate: Date): string {
  const interval = getExpectedInterval(subscription.frequency);
  const nextDate = new Date(chargeDate.getTime() + interval * 24 * 60 * 60 * 1000);
  return nextDate.toISOString();
}

/**
 * Convert a recurring pattern to a subscription
 */
export function patternToSubscription(
  pattern: RecurringPattern,
  categoryId: CategoryId,
  defaultNotifyDaysBefore: number
): Subscription {
  return {
    id: `sub-pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: pattern.merchantPattern,
    merchantPattern: pattern.merchantPattern,
    frequency: pattern.frequency,
    amount: pattern.averageAmount,
    amountVariance: pattern.amountStdDev,
    currency: 'MXN',
    expectedBillingDay: pattern.dayOfMonthMode,
    lastChargeDate: pattern.lastDate,
    status: 'active',
    detectionMethod: 'pattern-analysis',
    confidence: pattern.frequencyConfidence,
    categoryId,
    notifyBeforeRenewal: true,
    notifyDaysBefore: defaultNotifyDaysBefore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transactionIds: pattern.transactions,
  };
}

/**
 * Calculate total monthly spend from subscriptions
 */
export function calculateMonthlySpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.status === 'active')
    .reduce((total, sub) => {
      // Normalize to monthly
      switch (sub.frequency) {
        case 'weekly':
          return total + sub.amount * 4.33;
        case 'biweekly':
          return total + sub.amount * 2.17;
        case 'monthly':
          return total + sub.amount;
        case 'quarterly':
          return total + sub.amount / 3;
        case 'semi-annual':
          return total + sub.amount / 6;
        case 'annual':
          return total + sub.amount / 12;
        default:
          return total + sub.amount;
      }
    }, 0);
}

/**
 * Get frequency label for display
 */
export function getFrequencyLabel(frequency: BillingFrequency): string {
  const labels: Record<BillingFrequency, string> = {
    weekly: 'week',
    biweekly: '2 weeks',
    monthly: 'month',
    quarterly: 'quarter',
    'semi-annual': '6 months',
    annual: 'year',
    irregular: 'varies',
  };
  return labels[frequency];
}

// ============ Helper Functions ============

/**
 * Group transactions by normalized merchant name
 */
function groupByMerchant(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};

  for (const txn of transactions) {
    const normalized = txn.merchant.toUpperCase().trim();
    if (!groups[normalized]) {
      groups[normalized] = [];
    }
    groups[normalized].push(txn);
  }

  return groups;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate intervals between transactions in days
 */
function calculateIntervals(sortedTxns: Transaction[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < sortedTxns.length; i++) {
    const daysDiff = Math.round(
      (sortedTxns[i].date.getTime() - sortedTxns[i - 1].date.getTime()) / (24 * 60 * 60 * 1000)
    );
    intervals.push(daysDiff);
  }
  return intervals;
}

/**
 * Find mode (most common value) in array
 */
function findMode(values: number[]): number | undefined {
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let maxCount = 0;
  let mode: number | undefined;
  for (const [value, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mode = value;
    }
  }
  return mode;
}

/**
 * Get expected interval in days for a frequency
 */
function getExpectedInterval(frequency: BillingFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 7;
    case 'biweekly':
      return 14;
    case 'monthly':
      return 30;
    case 'quarterly':
      return 91;
    case 'semi-annual':
      return 182;
    case 'annual':
      return 365;
    default:
      return 30;
  }
}

/**
 * Extract common pattern from matching transactions
 */
function extractCommonPattern(transactions: Transaction[]): string {
  if (transactions.length === 0) return '';
  // Use the first merchant as the pattern
  return transactions[0].merchant.toUpperCase().trim();
}

/**
 * Estimate next billing date based on history
 */
function estimateNextBillingDate(
  sortedTxns: Transaction[], // Most recent first
  frequency: BillingFrequency
): Date | null {
  if (sortedTxns.length === 0) return null;

  const lastCharge = sortedTxns[0].date;
  const interval = getExpectedInterval(frequency);

  return new Date(lastCharge.getTime() + interval * 24 * 60 * 60 * 1000);
}

/**
 * Check if merchant matches any known service
 */
function isKnownService(merchant: string): boolean {
  return KNOWN_SERVICES.some((service) =>
    service.patterns.some((pattern) => {
      if (typeof pattern === 'string') {
        return merchant.toUpperCase().includes(pattern.toUpperCase());
      }
      return pattern.test(merchant);
    })
  );
}

/**
 * Classify billing frequency based on interval days
 */
function classifyFrequency(avgDays: number, stdDev: number): BillingFrequency {
  // Weekly: 6-8 days
  if (avgDays >= 6 && avgDays <= 8 && stdDev < 2) {
    return 'weekly';
  }
  // Biweekly: 13-15 days
  if (avgDays >= 13 && avgDays <= 15 && stdDev < 3) {
    return 'biweekly';
  }
  // Monthly: 28-32 days
  if (avgDays >= 28 && avgDays <= 32 && stdDev < 5) {
    return 'monthly';
  }
  // Quarterly: 85-95 days
  if (avgDays >= 85 && avgDays <= 95 && stdDev < 10) {
    return 'quarterly';
  }
  // Semi-annual: 175-190 days
  if (avgDays >= 175 && avgDays <= 190 && stdDev < 15) {
    return 'semi-annual';
  }
  // Annual: 355-375 days
  if (avgDays >= 355 && avgDays <= 375 && stdDev < 20) {
    return 'annual';
  }

  return 'irregular';
}

/**
 * Calculate confidence score for frequency detection
 */
function calculateFrequencyConfidence(intervals: number[], frequency: BillingFrequency): number {
  const expectedInterval = getExpectedInterval(frequency);
  if (expectedInterval === 0) return 0.5; // Irregular

  // Calculate how many intervals fall within expected range
  const tolerance = expectedInterval * 0.15; // 15% tolerance
  const matchingIntervals = intervals.filter((i) => Math.abs(i - expectedInterval) <= tolerance);

  const matchRatio = matchingIntervals.length / intervals.length;

  // Boost confidence for more occurrences
  const occurrenceBonus = Math.min(0.1, intervals.length * 0.02);

  return Math.min(1, matchRatio * 0.9 + occurrenceBonus);
}
