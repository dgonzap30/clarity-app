import type { Transaction } from '@/types';
import type { Subscription, BillingFrequency, KnownService } from '@/types/subscription';
import { KNOWN_SERVICES } from './subscription-detector';

/**
 * Price change detection result
 */
export interface PriceChange {
  date: Date;
  previousAmount: number;
  newAmount: number;
  percentChange: number;
  transactionId: string;
}

/**
 * Subscription analytics summary
 */
export interface SubscriptionAnalytics {
  totalLifetimeSpend: number;
  averageAmount: number;
  amountStdDev: number;
  monthlyProjection: number;
  annualProjection: number;
  chargeCount: number;
  subscriptionDurationDays: number;
  priceStabilityScore: number; // 0-1, higher = more stable
  firstChargeDate: Date | null;
  lastChargeDate: Date | null;
}

/**
 * Get transactions matching a subscription
 */
export function getSubscriptionTransactions(
  subscription: Subscription,
  transactions: Transaction[]
): Transaction[] {
  const pattern = subscription.merchantPattern.toUpperCase();
  const txnIdSet = new Set(subscription.transactionIds);

  return transactions
    .filter((t) => {
      // Match by ID if available
      if (txnIdSet.has(t.id)) return true;
      // Otherwise match by merchant pattern
      return t.merchant.toUpperCase().includes(pattern);
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Normalize amount to monthly equivalent
 */
export function normalizeToMonthly(amount: number, frequency: BillingFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33;
    case 'biweekly':
      return amount * 2.17;
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'semi-annual':
      return amount / 6;
    case 'annual':
      return amount / 12;
    default:
      return amount;
  }
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Calculate comprehensive analytics for a subscription
 */
export function calculateSubscriptionAnalytics(
  subscription: Subscription,
  transactions: Transaction[]
): SubscriptionAnalytics {
  const subTxns = getSubscriptionTransactions(subscription, transactions);

  if (subTxns.length === 0) {
    const monthly = normalizeToMonthly(subscription.amount, subscription.frequency);
    return {
      totalLifetimeSpend: 0,
      averageAmount: subscription.amount,
      amountStdDev: 0,
      monthlyProjection: monthly,
      annualProjection: monthly * 12,
      chargeCount: 0,
      subscriptionDurationDays: 0,
      priceStabilityScore: 1,
      firstChargeDate: null,
      lastChargeDate: null,
    };
  }

  const amounts = subTxns.map((t) => t.amount);
  const total = amounts.reduce((a, b) => a + b, 0);
  const avg = total / amounts.length;
  const stdDev = calculateStdDev(amounts);
  const stability = avg > 0 ? Math.max(0, Math.min(1, 1 - stdDev / avg)) : 1;

  const sortedByDate = [...subTxns].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sortedByDate[0].date;
  const lastDate = sortedByDate[sortedByDate.length - 1].date;
  const durationDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  const monthly = normalizeToMonthly(avg, subscription.frequency);

  return {
    totalLifetimeSpend: total,
    averageAmount: avg,
    amountStdDev: stdDev,
    monthlyProjection: monthly,
    annualProjection: monthly * 12,
    chargeCount: subTxns.length,
    subscriptionDurationDays: durationDays,
    priceStabilityScore: stability,
    firstChargeDate: firstDate,
    lastChargeDate: lastDate,
  };
}

/**
 * Detect price changes in subscription history
 */
export function detectPriceChanges(
  subscription: Subscription,
  transactions: Transaction[],
  thresholdPercent: number = 5
): PriceChange[] {
  const subTxns = getSubscriptionTransactions(subscription, transactions);

  if (subTxns.length < 2) return [];

  // Sort chronologically (oldest first)
  const sorted = [...subTxns].sort((a, b) => a.date.getTime() - b.date.getTime());

  const changes: PriceChange[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const diff = curr.amount - prev.amount;
    const percentChange = (diff / prev.amount) * 100;

    // Only flag significant changes
    if (Math.abs(percentChange) >= thresholdPercent) {
      changes.push({
        date: curr.date,
        previousAmount: prev.amount,
        newAmount: curr.amount,
        percentChange,
        transactionId: curr.id,
      });
    }
  }

  return changes;
}

/**
 * Get known service details if subscription matches
 */
export function getKnownServiceInfo(subscription: Subscription): KnownService | null {
  if (!subscription.knownServiceId) return null;
  return KNOWN_SERVICES.find((s) => s.id === subscription.knownServiceId) || null;
}

/**
 * Get detection explanation text
 */
export function getDetectionExplanation(subscription: Subscription): string {
  switch (subscription.detectionMethod) {
    case 'known-service': {
      const service = getKnownServiceInfo(subscription);
      return service
        ? `Matched against known service "${service.name}" using pattern recognition.`
        : 'Identified as a known subscription service.';
    }

    case 'pattern-analysis':
      return `Detected through recurring charge analysis. ${subscription.transactionIds.length} transactions match the pattern "${subscription.merchantPattern}" with ${subscription.frequency} frequency.`;

    case 'user-confirmed':
      return 'Manually confirmed by user as a recurring subscription.';

    default:
      return 'Subscription detected automatically.';
  }
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: BillingFrequency): string {
  switch (frequency) {
    case 'weekly':
      return 'week';
    case 'biweekly':
      return '2 weeks';
    case 'monthly':
      return 'month';
    case 'quarterly':
      return 'quarter';
    case 'semi-annual':
      return '6 months';
    case 'annual':
      return 'year';
    case 'irregular':
      return 'irregular';
    default:
      return frequency;
  }
}

/**
 * Get days until next renewal
 */
export function getDaysUntilRenewal(subscription: Subscription): number | null {
  if (!subscription.nextExpectedDate) return null;
  const nextDate = new Date(subscription.nextExpectedDate);
  const now = new Date();
  const diffTime = nextDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format duration in human readable form
 */
export function formatDuration(days: number): string {
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  return `${years}y ${remainingMonths}mo`;
}
