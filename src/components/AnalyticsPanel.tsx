import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AllTimeIndicator, OverallTab } from '@/components/overall';
import type { Transaction, Category } from '@/types';
import type { OverallAnalytics } from '@/hooks/useOverallAnalytics';

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Record<string, Category>;
  categoryList: Category[];
  analytics: OverallAnalytics;
}

export function AnalyticsPanel({
  isOpen,
  onClose,
  transactions,
  categories,
  categoryList,
  analytics,
}: AnalyticsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] lg:w-[800px] bg-background border-l border-border shadow-lg overflow-y-auto animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-panel-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="analytics-panel-title" className="text-xl font-semibold">
              Analytics
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              All-time spending insights
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close analytics panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date range indicator */}
          <AllTimeIndicator
            dateRange={analytics.dateRange}
            transactionCount={analytics.transactionCount}
          />

          {/* Overall analytics tabs */}
          <OverallTab
            transactions={transactions}
            categories={categories}
            categoryList={categoryList}
            analytics={analytics}
          />
        </div>
      </div>
    </>
  );
}
