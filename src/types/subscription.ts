import type { CategoryId } from './index';

/**
 * Billing frequency for subscriptions
 */
export type BillingFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semi-annual'
  | 'annual'
  | 'irregular';

/**
 * Detection method - how the subscription was identified
 */
export type DetectionMethod =
  | 'known-service' // Matched against known services database
  | 'pattern-analysis' // Detected via recurring pattern algorithm
  | 'user-confirmed'; // User manually marked as subscription

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | 'active' // Currently being charged
  | 'paused' // No recent charges, but not cancelled
  | 'cancelled' // User marked as cancelled
  | 'pending'; // Newly detected, awaiting confirmation

/**
 * Known service definition (for built-in detection)
 */
export interface KnownService {
  id: string;
  name: string;
  patterns: (string | RegExp)[];
  defaultFrequency: BillingFrequency;
  defaultCategoryId: CategoryId;
  icon?: string;
  website?: string;
}

/**
 * A detected or confirmed subscription
 */
export interface Subscription {
  id: string;

  // Service identification
  name: string;
  merchantPattern: string; // Pattern used to match transactions
  knownServiceId?: string; // Reference to known service, if any

  // Billing details
  frequency: BillingFrequency;
  amount: number; // Expected/average amount
  amountVariance: number; // Allowed variance (for services with variable pricing)
  currency: string;

  // Timing
  expectedBillingDay?: number; // Day of month (1-31) or day of week (0-6)
  nextExpectedDate?: string; // ISO date of next expected charge
  lastChargeDate?: string; // ISO date of most recent charge

  // Status and tracking
  status: SubscriptionStatus;
  detectionMethod: DetectionMethod;
  confidence: number; // 0-1, how confident the detection is

  // User preferences
  categoryId: CategoryId;
  notifyBeforeRenewal: boolean;
  notifyDaysBefore: number; // Days before renewal to notify

  // Metadata
  createdAt: string;
  updatedAt: string;
  transactionIds: string[]; // IDs of matched transactions
}

/**
 * Recurring pattern detected in transactions
 */
export interface RecurringPattern {
  merchantPattern: string;
  transactions: string[]; // Transaction IDs
  averageAmount: number;
  amountStdDev: number;
  frequency: BillingFrequency;
  frequencyConfidence: number;
  dayOfMonthMode?: number; // Most common day of month
  intervalDays: number; // Average days between charges
  intervalStdDev: number;
  firstDate: string;
  lastDate: string;
  occurrenceCount: number;
}

/**
 * Upcoming renewal notification
 */
export interface UpcomingRenewal {
  subscriptionId: string;
  subscriptionName: string;
  expectedDate: string;
  expectedAmount: number;
  daysUntil: number;
  categoryId: CategoryId;
}

/**
 * Subscription settings stored in UserSettings
 */
export interface SubscriptionSettings {
  // Detection preferences
  enableAutoDetection: boolean;
  minimumOccurrences: number; // Min charges to detect pattern (default: 2)
  confidenceThreshold: number; // 0-1, min confidence to show (default: 0.7)

  // Notification preferences
  enableRenewalNotifications: boolean;
  defaultNotifyDaysBefore: number; // Default days before to notify (default: 3)

  // User-managed subscriptions
  subscriptions: Subscription[];

  // Ignored patterns (user chose to ignore)
  ignoredPatterns: string[];
}

/**
 * Detection result from analyzing transactions
 */
export interface SubscriptionDetectionResult {
  knownServices: Subscription[]; // Detected known services
  patterns: RecurringPattern[]; // Detected recurring patterns
  upcomingRenewals: UpcomingRenewal[];
}

/**
 * Default subscription settings
 */
export const DEFAULT_SUBSCRIPTION_SETTINGS: SubscriptionSettings = {
  enableAutoDetection: true,
  minimumOccurrences: 2,
  confidenceThreshold: 0.7,
  enableRenewalNotifications: true,
  defaultNotifyDaysBefore: 3,
  subscriptions: [],
  ignoredPatterns: [],
};
