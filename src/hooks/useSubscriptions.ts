import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Transaction, CategoryId } from '@/types';
import type { UserSettings } from '@/types/settings';
import type {
  Subscription,
  RecurringPattern,
  UpcomingRenewal,
} from '@/types/subscription';
import {
  detectKnownServices,
  analyzeRecurringPatterns,
  getUpcomingRenewals,
  patternToSubscription,
  calculateMonthlySpend,
} from '@/lib/subscription-detector';

export interface UseSubscriptionsReturn {
  // Data
  subscriptions: Subscription[];
  detectedPatterns: RecurringPattern[];
  upcomingRenewals: UpcomingRenewal[];

  // Detection
  runDetection: () => void;
  isDetecting: boolean;

  // Management
  confirmSubscription: (pattern: RecurringPattern, categoryId: CategoryId) => void;
  dismissPattern: (pattern: string) => void;
  cancelSubscription: (subscriptionId: string) => void;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => void;
  removeSubscription: (subscriptionId: string) => void;

  // Stats
  totalMonthlySpend: number;
  annualProjection: number;
  activeCount: number;
}

export function useSubscriptions(
  transactions: Transaction[],
  settings: UserSettings,
  onSettingsChange: (settings: UserSettings) => void
): UseSubscriptionsReturn {
  const [detectedPatterns, setDetectedPatterns] = useState<RecurringPattern[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const subscriptionSettings = settings.subscriptions;
  const subscriptions = subscriptionSettings?.subscriptions || [];

  // Run detection on transactions
  const runDetection = useCallback(() => {
    if (!subscriptionSettings?.enableAutoDetection) return;

    setIsDetecting(true);

    // Detect known services
    const knownSubs = detectKnownServices(
      transactions,
      subscriptions,
      subscriptionSettings.ignoredPatterns
    );

    // Auto-add high-confidence known services
    let updatedSettings = settings;
    for (const sub of knownSubs) {
      if (sub.confidence >= 0.9) {
        updatedSettings = addSubscriptionToSettings(updatedSettings, sub);
      }
    }

    // Analyze for unknown recurring patterns
    const patterns = analyzeRecurringPatterns(transactions, subscriptionSettings);

    // Filter out patterns that match existing subscriptions
    const existingPatterns = new Set(subscriptions.map((s) => s.merchantPattern.toUpperCase()));
    const newPatterns = patterns.filter(
      (p) => !existingPatterns.has(p.merchantPattern.toUpperCase())
    );

    setDetectedPatterns(newPatterns);

    if (updatedSettings !== settings) {
      onSettingsChange(updatedSettings);
    }

    setIsDetecting(false);
  }, [transactions, settings, subscriptions, subscriptionSettings, onSettingsChange]);

  // Calculate upcoming renewals
  const upcomingRenewals = useMemo(() => {
    return getUpcomingRenewals(subscriptions, 30);
  }, [subscriptions]);

  // Confirm a detected pattern as subscription
  const confirmSubscription = useCallback(
    (pattern: RecurringPattern, categoryId: CategoryId) => {
      const newSub = patternToSubscription(
        pattern,
        categoryId,
        subscriptionSettings?.defaultNotifyDaysBefore || 3
      );

      const updated = addSubscriptionToSettings(settings, newSub);
      onSettingsChange(updated);

      // Remove from detected patterns
      setDetectedPatterns((prev) =>
        prev.filter((p) => p.merchantPattern !== pattern.merchantPattern)
      );
    },
    [settings, subscriptionSettings, onSettingsChange]
  );

  // Dismiss a pattern (add to ignore list)
  const dismissPattern = useCallback(
    (pattern: string) => {
      const normalized = pattern.toUpperCase().trim();
      if (subscriptionSettings.ignoredPatterns.includes(normalized)) {
        return;
      }

      const updated: UserSettings = {
        ...settings,
        subscriptions: {
          ...subscriptionSettings,
          ignoredPatterns: [...subscriptionSettings.ignoredPatterns, normalized],
        },
      };
      onSettingsChange(updated);

      setDetectedPatterns((prev) => prev.filter((p) => p.merchantPattern !== pattern));
    },
    [settings, subscriptionSettings, onSettingsChange]
  );

  // Cancel a subscription (mark as cancelled)
  const cancelSubscription = useCallback(
    (subscriptionId: string) => {
      const updated: UserSettings = {
        ...settings,
        subscriptions: {
          ...subscriptionSettings,
          subscriptions: subscriptionSettings.subscriptions.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
              : sub
          ),
        },
      };
      onSettingsChange(updated);
    },
    [settings, subscriptionSettings, onSettingsChange]
  );

  // Update subscription
  const updateSubscription = useCallback(
    (subscriptionId: string, updates: Partial<Subscription>) => {
      const updated: UserSettings = {
        ...settings,
        subscriptions: {
          ...subscriptionSettings,
          subscriptions: subscriptionSettings.subscriptions.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, ...updates, updatedAt: new Date().toISOString() }
              : sub
          ),
        },
      };
      onSettingsChange(updated);
    },
    [settings, subscriptionSettings, onSettingsChange]
  );

  // Remove subscription completely
  const removeSubscription = useCallback(
    (subscriptionId: string) => {
      const updated: UserSettings = {
        ...settings,
        subscriptions: {
          ...subscriptionSettings,
          subscriptions: subscriptionSettings.subscriptions.filter(
            (sub) => sub.id !== subscriptionId
          ),
        },
      };
      onSettingsChange(updated);
    },
    [settings, subscriptionSettings, onSettingsChange]
  );

  // Calculate stats
  const totalMonthlySpend = useMemo(() => {
    return calculateMonthlySpend(subscriptions);
  }, [subscriptions]);

  const annualProjection = totalMonthlySpend * 12;

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;

  // Run detection on mount and when transactions change significantly
  useEffect(() => {
    if (transactions.length > 0 && subscriptionSettings?.enableAutoDetection) {
      runDetection();
    }
    // Only re-run when transaction count changes significantly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(transactions.length / 10)]);

  return {
    subscriptions,
    detectedPatterns,
    upcomingRenewals,
    runDetection,
    isDetecting,
    confirmSubscription,
    dismissPattern,
    cancelSubscription,
    updateSubscription,
    removeSubscription,
    totalMonthlySpend,
    annualProjection,
    activeCount,
  };
}

// Helper function to add a subscription to settings
function addSubscriptionToSettings(
  settings: UserSettings,
  subscription: Subscription
): UserSettings {
  return {
    ...settings,
    subscriptions: {
      ...settings.subscriptions,
      subscriptions: [...settings.subscriptions.subscriptions, subscription],
    },
  };
}
