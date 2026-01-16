import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { MonthNavigation } from '@/components/MonthNavigation';
import { TotalHeroCard } from '@/components/dashboard/TotalHeroCard';
import { BudgetHeroCard } from '@/components/dashboard/BudgetHeroCard';
import { BudgetCategoryCard } from '@/components/dashboard/BudgetCategoryCard';
import { BudgetStatusStrip } from '@/components/dashboard/BudgetStatusStrip';
import { BudgetHistoryChart } from '@/components/dashboard/BudgetHistoryChart';
import { SpendingVelocityCard } from '@/components/dashboard/SpendingVelocityCard';
import { TopMerchantsCard } from '@/components/dashboard/TopMerchantsCard';
import { NonBudgetedHeroCard } from '@/components/dashboard/NonBudgetedHeroCard';
import { NonBudgetedCategoryCard } from '@/components/dashboard/NonBudgetedCategoryCard';
import { CompactStatsBar } from '@/components/dashboard/CompactStatsBar';
import { AllCategoriesSpending } from '@/components/dashboard/AllCategoriesSpending';
import { InsightsCard } from '@/components/dashboard/InsightsCard';
import { AddBudgetCard } from '@/components/dashboard/AddBudgetCard';
import { AddCategoryCard } from '@/components/dashboard/AddCategoryCard';

import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { TransactionList } from '@/components/transactions/TransactionList';
import {
  SubscriptionsHeroCard,
  SubscriptionGrid,
  UpcomingRenewals,
} from '@/components/subscriptions';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { CSVUploadModal } from '@/components/modals/CSVUploadModal';
import { CategoryDetailModal } from '@/components/modals/CategoryDetailModal';
import { SubscriptionDetailModal } from '@/components/modals/SubscriptionDetailModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { PDFExport } from '@/components/PDFExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseCSV } from '@/lib/csv-parser';
import { loadTransactions, saveTransactions, clearTransactions } from '@/lib/storage';
import { downloadJSON, downloadCSV } from '@/lib/export';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useInsights } from '@/hooks/useInsights';
import { useOverallAnalytics } from '@/hooks/useOverallAnalytics';

import type { Transaction, Category } from '@/types';
import type { Subscription } from '@/types/subscription';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [pdfExportRef, setPdfExportRef] = useState<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analyticsPanelOpen, setAnalyticsPanelOpen] = useState(false);
  const [showNonBudgeted, setShowNonBudgeted] = useState(false);

  // Settings hook
  const settingsHook = useSettings();

  // Categories hook - provides dynamic categories (default + custom)
  const { categories, categoryList } = useCategories(settingsHook.settings);

  // Subscriptions hook - provides subscription detection and management
  const subscriptionsHook = useSubscriptions(
    transactions,
    settingsHook.settings,
    settingsHook.updateSettings
  );

  // Insights hook - provides spending analysis and comparisons
  const insights = useInsights(transactions, selectedMonth);

  // Overall analytics hook - all-time data aggregation
  const overallAnalytics = useOverallAnalytics(transactions, categories);

  useEffect(() => {
    async function loadData() {
      try {
        // Try loading from localStorage first
        const stored = loadTransactions();
        if (stored && stored.length > 0) {
          setTransactions(stored);
          setLoading(false);
          return;
        }

        // Fall back to CSV fetch if no stored data
        const response = await fetch('/data/centurion.csv');
        const csvContent = await response.text();
        const parsed = parseCSV(csvContent);
        setTransactions(parsed);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions]);

  const handleCSVUpload = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    // Transactions will be auto-saved via useEffect
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    // Learn pattern if category changed and pattern learning is enabled
    if (updates.category && settingsHook.settings.preferences.enablePatternLearning) {
      const transaction = transactions.find((t) => t.id === id);
      if (transaction && transaction.merchant) {
        settingsHook.learnPattern(transaction.merchant, updates.category.id);
      }
    }
  }, [transactions, settingsHook]);

  const handleExportPDF = () => {
    if (pdfExportRef) {
      // Trigger PDF export - the PDFExport component will handle it
      const event = new CustomEvent('trigger-pdf-export');
      window.dispatchEvent(event);
    }
  };

  const handleExportJSON = useCallback(() => {
    downloadJSON(transactions);
  }, [transactions]);

  const handleExportCSV = useCallback(() => {
    downloadCSV(transactions);
  }, [transactions]);

  const handleClearTransactions = useCallback(() => {
    clearTransactions();
    setTransactions([]);
  }, []);

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.date.getMonth() === selectedMonth.getMonth() &&
        t.date.getFullYear() === selectedMonth.getFullYear()
    );
  }, [transactions, selectedMonth]);

  // Get budgeted categories based on settings
  const budgetedCategories = useMemo(() => {
    return categoryList.filter(
      (c) => settingsHook.settings.budgets[c.id]?.enabled
    );
  }, [categoryList, settingsHook.settings.budgets]);

  // Get non-budgeted categories based on settings
  const nonBudgetedCategories = useMemo(() => {
    return categoryList.filter(
      (c) => !settingsHook.settings.budgets[c.id]?.enabled
    );
  }, [categoryList, settingsHook.settings.budgets]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === 'u') {
        e.preventDefault();
        setUploadModalOpen(true);
      } else if (isMeta && e.key === ',') {
        e.preventDefault();
        setSettingsModalOpen(true);
      } else if (e.key === 'ArrowLeft' && !isMeta) {
        e.preventDefault();
        setSelectedMonth((prev) => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() - 1);
          return newDate;
        });
      } else if (e.key === 'ArrowRight' && !isMeta) {
        e.preventDefault();
        setSelectedMonth((prev) => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() + 1);
          return newDate;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <ThemeProvider defaultTheme="light">
        <div className="min-h-screen bg-background">
          <Header
            onUploadClick={() => {}}
            onExportPDF={() => {}}
            onExportJSON={() => {}}
            onExportCSV={() => {}}
            onSettingsClick={() => {}}
          />
          <main className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
            <DashboardSkeleton />
          </main>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background">
        {/* Skip link for keyboard accessibility */}
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        <Header
          onUploadClick={() => setUploadModalOpen(true)}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onSettingsClick={() => setSettingsModalOpen(true)}
          onAnalyticsClick={() => setAnalyticsPanelOpen(true)}
        />
        <main id="main-content" className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Navigation row: Month selector + Tabs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <MonthNavigation
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
            </div>

            {/* Dashboard Tab - Total spending at a glance */}
            <TabsContent value="dashboard" className="space-y-8" ref={setPdfExportRef}>
              {/* Total Hero Card - Shows all spending with budgeted vs non-budgeted split */}
              <TotalHeroCard
                transactions={transactions}
                month={selectedMonth}
                budgetedCategories={budgetedCategories}
                nonBudgetedCategories={nonBudgetedCategories}
                settings={settingsHook.settings}
                onUploadClick={() => setUploadModalOpen(true)}
                onNavigateToBudget={() => setActiveTab('budget')}
              />

              {/* Section separator */}
              <div className="border-t border-border/50" />

              {/* Compact Stats Bar */}
              <CompactStatsBar
                transactions={monthTransactions}
                allTransactions={transactions}
                month={selectedMonth}
                settings={settingsHook.settings}
              />

              {/* Section separator */}
              <div className="border-t border-border/50" />

              {/* Smart Insights */}
              <InsightsCard
                insights={insights}
                categories={categories}
                transactions={monthTransactions}
                month={selectedMonth}
                settings={settingsHook.settings}
              />

              {/* Section separator */}
              <div className="border-t border-border/50" />

              {/* Two column: All Categories + Top Merchants */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 items-stretch">
                <AllCategoriesSpending
                  transactions={monthTransactions}
                  categories={categoryList}
                  onCategoryClick={setSelectedCategory}
                />
                <TopMerchantsCard
                  transactions={transactions}
                  month={selectedMonth}
                  limit={5}
                />
              </div>

              {/* Section separator */}
              <div className="border-t border-border/50" />

              {/* Monthly Trend Chart */}
              <MonthlyTrendChart
                transactions={transactions}
                categories={categories}
                categoryList={categoryList}
                currentMonth={selectedMonth}
                settings={settingsHook.settings}
              />

              {/* PDF Export - hidden but available for export */}
              <div className="hidden">
                <PDFExport />
              </div>
            </TabsContent>

            {/* Budget Tab - Budgeted + collapsible non-budgeted categories */}
            <TabsContent value="budget" className="space-y-8">
              {/* Budget Status Strip - Persistent indicator */}
              <BudgetStatusStrip
                transactions={transactions}
                month={selectedMonth}
                settings={settingsHook.settings}
                onNavigateToBudget={() => {}}
              />

              {/* Budget Hero - Budget status and projections */}
              <BudgetHeroCard
                transactions={transactions}
                month={selectedMonth}
                settings={settingsHook.settings}
              />

              {/* Budget Insights - Historical trend and spending velocity */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <BudgetHistoryChart
                  transactions={transactions}
                  settings={settingsHook.settings}
                  months={6}
                />
                <SpendingVelocityCard
                  transactions={transactions}
                  month={selectedMonth}
                  settings={settingsHook.settings}
                />
              </div>

              {/* Budgeted Categories */}
              <div className="space-y-4">
                <div className="pb-3 border-b">
                  <h2 className="text-lg font-semibold">Budgeted Categories</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track spending against your monthly budget limits
                  </p>
                </div>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                  {budgetedCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="animate-card-enter"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <BudgetCategoryCard
                        category={category}
                        transactions={transactions}
                        month={selectedMonth}
                        budget={settingsHook.settings.budgets[category.id]?.amount || 0}
                        onClick={() => setSelectedCategory(category)}
                      />
                    </div>
                  ))}
                  <AddBudgetCard />
                </div>
              </div>

              {/* Collapsible Non-Budgeted Section */}
              {nonBudgetedCategories.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <button
                    onClick={() => setShowNonBudgeted(!showNonBudgeted)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${showNonBudgeted ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Non-Budgeted Categories ({nonBudgetedCategories.length})
                  </button>

                  {showNonBudgeted && (
                    <div className="space-y-4 animate-fade-in">
                      <NonBudgetedHeroCard
                        transactions={transactions}
                        month={selectedMonth}
                        nonBudgetedCategories={nonBudgetedCategories}
                      />
                      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {nonBudgetedCategories.map((category, index) => (
                          <div
                            key={category.id}
                            className="animate-card-enter"
                            style={{ animationDelay: `${index * 25}ms` }}
                          >
                            <NonBudgetedCategoryCard
                              category={category}
                              transactions={transactions}
                              month={selectedMonth}
                              onClick={() => setSelectedCategory(category)}
                            />
                          </div>
                        ))}
                        <AddCategoryCard />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Subscriptions Tab - Recurring subscription management */}
            <TabsContent value="subscriptions" className="space-y-8">
              {/* Subscriptions Hero - Summary stats */}
              <SubscriptionsHeroCard
                totalMonthlySpend={subscriptionsHook.totalMonthlySpend}
                annualProjection={subscriptionsHook.annualProjection}
                activeCount={subscriptionsHook.activeCount}
                upcomingRenewals={subscriptionsHook.upcomingRenewals}
                onRefresh={subscriptionsHook.runDetection}
                isDetecting={subscriptionsHook.isDetecting}
              />

              {/* Two column layout: Grid + Upcoming */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Main subscription grid */}
                <div className="lg:col-span-2">
                  <SubscriptionGrid
                    subscriptions={subscriptionsHook.subscriptions}
                    onSubscriptionClick={setSelectedSubscription}
                  />
                </div>

                {/* Upcoming renewals sidebar - sticky on desktop */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                  <UpcomingRenewals renewals={subscriptionsHook.upcomingRenewals} />
                </div>
              </div>
            </TabsContent>

            {/* Transactions Tab - Detailed transaction list */}
            <TabsContent value="transactions" className="space-y-8">
              <TransactionList
                transactions={monthTransactions}
                selectedMonth={selectedMonth}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                confirmDestructive={settingsHook.settings.preferences.confirmDestructiveActions}
                categories={categories}
              />
            </TabsContent>
          </Tabs>
        </main>

        {/* CSV Upload Modal */}
        <CSVUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          onUpload={handleCSVUpload}
          existingTransactions={transactions}
          defaultUploadMode={settingsHook.settings.preferences.defaultUploadMode}
        />

        {/* Category Detail Modal */}
        <CategoryDetailModal
          category={selectedCategory}
          transactions={monthTransactions}
          onClose={() => setSelectedCategory(null)}
          budget={selectedCategory ? settingsHook.settings.budgets[selectedCategory.id] : undefined}
        />

        {/* Settings Modal */}
        <SettingsModal
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          settingsHook={settingsHook}
          transactionCount={transactions.length}
          onClearTransactions={handleClearTransactions}
        />

        {/* Subscription Detail Modal */}
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          transactions={transactions}
          categories={categories}
          onClose={() => setSelectedSubscription(null)}
          onUpdate={subscriptionsHook.updateSubscription}
          onCancel={subscriptionsHook.cancelSubscription}
          onRemove={subscriptionsHook.removeSubscription}
        />

        {/* Analytics Panel */}
        <AnalyticsPanel
          isOpen={analyticsPanelOpen}
          onClose={() => setAnalyticsPanelOpen(false)}
          transactions={transactions}
          categories={categories}
          categoryList={categoryList}
          analytics={overallAnalytics}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
