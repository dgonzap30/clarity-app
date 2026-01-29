import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';

import { Routes, Route } from 'react-router-dom';
import { SettingsPage } from '@/pages/SettingsPage';
import { LayoutDashboard, Wallet, RefreshCw, Receipt } from 'lucide-react';
import { Header } from '@/components/Header';
import { MonthNavigation } from '@/components/MonthNavigation';
import { TotalHeroCard } from '@/components/dashboard/TotalHeroCard';
import { BudgetHeroCard } from '@/components/dashboard/BudgetHeroCard';
import { BudgetCategoryCard } from '@/components/dashboard/BudgetCategoryCard';
import { BudgetStatusStrip } from '@/components/dashboard/BudgetStatusStrip';
import { BudgetHistoryChart } from '@/components/dashboard/BudgetHistoryChart';
import { SpendingVelocityCard } from '@/components/dashboard/SpendingVelocityCard';
import { NonBudgetedHeroCard } from '@/components/dashboard/NonBudgetedHeroCard';
import { NonBudgetedCategoryCard } from '@/components/dashboard/NonBudgetedCategoryCard';
import { AddBudgetCard } from '@/components/dashboard/AddBudgetCard';
import { AddCategoryCard } from '@/components/dashboard/AddCategoryCard';

import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import {
  SubscriptionsHeroCard,
  SubscriptionGrid,
  UpcomingRenewals,
} from '@/components/subscriptions';
import { CSVUploadModal } from '@/components/modals/CSVUploadModal';
import { CategoryDetailModal } from '@/components/modals/CategoryDetailModal';
import { SubscriptionDetailModal } from '@/components/modals/SubscriptionDetailModal';
import { PDFExport } from '@/components/PDFExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseCSV } from '@/lib/csv-parser';
import { loadTransactions, saveTransactions } from '@/lib/storage';
import { downloadJSON, downloadCSV } from '@/lib/export';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useInsights } from '@/hooks/useInsights';
import { useOverallAnalytics } from '@/hooks/useOverallAnalytics';

// Lazy load components below the fold for better initial page load performance
const CompactStatsBar = lazy(() => import('@/components/dashboard/CompactStatsBar').then(m => ({ default: m.CompactStatsBar })))
const InsightsCard = lazy(() => import('@/components/dashboard/InsightsCard').then(m => ({ default: m.InsightsCard })))
const AllCategoriesSpending = lazy(() => import('@/components/dashboard/AllCategoriesSpending').then(m => ({ default: m.AllCategoriesSpending })))
const TopMerchantsCard = lazy(() => import('@/components/dashboard/TopMerchantsCard').then(m => ({ default: m.TopMerchantsCard })))
const MonthlyTrendChart = lazy(() => import('@/components/dashboard/MonthlyTrendChart').then(m => ({ default: m.MonthlyTrendChart })))
const TransactionList = lazy(() => import('@/components/transactions/TransactionList').then(m => ({ default: m.TransactionList })))
const AnalyticsPanel = lazy(() => import('@/components/AnalyticsPanel').then(m => ({ default: m.AnalyticsPanel })))

import type { Transaction, Category } from '@/types';
import type { Subscription } from '@/types/subscription';
import type { UserSettings } from '@/types/settings';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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
        if (stored) {
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

  // Save transactions to localStorage whenever they change (but not during initial load)
  useEffect(() => {
    // Skip auto-save during initial load to prevent overwriting stored data
    if (loading) {
      return;
    }

    try {
      saveTransactions(transactions);
    } catch (error) {
      // Handle QuotaExceededError - show user-facing alert
      if (error instanceof Error && error.message.includes('localStorage quota exceeded')) {
        alert(
          '⚠️ Storage Limit Reached!\n\n' +
          error.message + '\n\n' +
          'Your changes could not be saved. Please:\n' +
          '1. Export your data (Settings → Export)\n' +
          '2. Remove receipt attachments from old transactions\n' +
          '3. Or delete transactions you no longer need'
        );
      } else {
        console.error('Failed to save transactions:', error);
      }
    }
  }, [transactions, loading]);

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

  const handleAddTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => {
      // Add the new transaction and sort by date (newest first)
      const updated = [...prev, transaction];
      return updated.sort((a, b) => b.date.getTime() - a.date.getTime());
    });
  }, []);

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
    setTransactions([]);
  }, []);

  const handleImportData = useCallback((importedTransactions: Transaction[], importedSettings: UserSettings) => {
    // Update transactions
    setTransactions(importedTransactions);
    saveTransactions(importedTransactions);

    // Update settings
    settingsHook.updateSettings(importedSettings);
  }, [settingsHook]);

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
        window.location.href = '/settings';
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
      } else if (e.key === '1' && !isMeta) {
        e.preventDefault();
        setActiveTab('dashboard');
      } else if (e.key === '2' && !isMeta) {
        e.preventDefault();
        setActiveTab('budget');
      } else if (e.key === '3' && !isMeta) {
        e.preventDefault();
        setActiveTab('subscriptions');
      } else if (e.key === '4' && !isMeta) {
        e.preventDefault();
        setActiveTab('transactions');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUploadClick={() => {}}
          onExportPDF={() => {}}
          onExportJSON={() => {}}
          onExportCSV={() => {}}
        />
        <main className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <Routes>
                    <Route path="/settings" element={
                      <div className="min-h-screen bg-background">
                        <Header
                          onUploadClick={() => setUploadModalOpen(true)}
                          onExportPDF={handleExportPDF}
                          onExportJSON={handleExportJSON}
                          onExportCSV={handleExportCSV}
                          onAnalyticsClick={() => setAnalyticsPanelOpen(true)}
                        />
                        <main className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
                          <SettingsPage
                            settingsHook={settingsHook}
                            transactionCount={transactions.length}
                            onClearTransactions={handleClearTransactions}
                            onAddTransaction={handleAddTransaction}
                            transactions={transactions}
                            onUpdateTransaction={handleUpdateTransaction}
                            onImportData={handleImportData}
                          />
                        </main>
                      </div>
                    } />
                    <Route path="/*" element={
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
                                <TabsTrigger value="dashboard">
                                  <LayoutDashboard className="h-4 w-4 mr-2" />
                                  Dashboard
                                </TabsTrigger>
                                <TabsTrigger value="budget">
                                  <Wallet className="h-4 w-4 mr-2" />
                                  Budget
                                </TabsTrigger>
                                <TabsTrigger value="subscriptions">
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Subscriptions
                                </TabsTrigger>
                                <TabsTrigger value="transactions">
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Transactions
                                </TabsTrigger>
                              </TabsList>
                            </div>
      
                            {/* Dashboard Tab - Total spending at a glance */}
                            <TabsContent value="dashboard" ref={setPdfExportRef}>
                              <h2 className="sr-only">Dashboard Overview</h2>
                              <div className="space-y-8">
                                {/* Total spending overview */}
                                <TotalHeroCard
                                  transactions={transactions}
                                  month={selectedMonth}
                                  budgetedCategories={budgetedCategories}
                                  nonBudgetedCategories={nonBudgetedCategories}
                                  settings={settingsHook.settings}
                                  onUploadClick={() => setUploadModalOpen(true)}
                                  onNavigateToBudget={() => setActiveTab('budget')}
                                />

                                {/* Budget Status Strip */}
                                <BudgetStatusStrip
                                  transactions={transactions}
                                  month={selectedMonth}
                                  settings={settingsHook.settings}
                                  onNavigateToBudget={() => setActiveTab('budget')}
                                />

                                {/* Existing dashboard components */}
                                <Suspense fallback={<div>Loading...</div>}>
                                  <CompactStatsBar
                                    transactions={monthTransactions}
                                    allTransactions={transactions}
                                    month={selectedMonth}
                                    settings={settingsHook.settings}
                                  />
                                </Suspense>

                                <Suspense fallback={<div>Loading...</div>}>
                                  <InsightsCard
                                    insights={insights}
                                    categories={categories}
                                    transactions={monthTransactions}
                                    month={selectedMonth}
                                    settings={settingsHook.settings}
                                  />
                                </Suspense>

                                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                                  <Suspense fallback={<div>Loading...</div>}>
                                    <AllCategoriesSpending
                                      transactions={monthTransactions}
                                      categories={categoryList}
                                      onCategoryClick={setSelectedCategory}
                                    />
                                  </Suspense>
                                  <Suspense fallback={<div>Loading...</div>}>
                                    <TopMerchantsCard
                                      transactions={transactions}
                                      month={selectedMonth}
                                      limit={5}
                                    />
                                  </Suspense>
                                </div>

                                <Suspense fallback={<div>Loading...</div>}>
                                  <MonthlyTrendChart
                                    transactions={transactions}
                                    categories={categories}
                                    categoryList={categoryList}
                                    currentMonth={selectedMonth}
                                    settings={settingsHook.settings}
                                  />
                                </Suspense>
                              </div>
                              {/* PDF Export - hidden but available for export */}
                              <div className="hidden">
                                <PDFExport />
                              </div>
                            </TabsContent>
      
                            {/* Budget Tab - Budgeted + collapsible non-budgeted categories */}
                            <TabsContent value="budget" className="space-y-8">
                              <h2 className="sr-only">Budget Management</h2>
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
                                  <h3 className="text-lg font-semibold">Budgeted Categories</h3>
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
                              <h2 className="sr-only">Subscriptions</h2>
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
      
                            {/* Transactions Tab - Detailed transaction list - Lazy loaded */}
                            <TabsContent value="transactions" className="space-y-8">
                              <h2 className="sr-only">Transactions</h2>
                              <Suspense fallback={<div>Loading...</div>}>
                                <TransactionList
                                  transactions={monthTransactions}
                                  selectedMonth={selectedMonth}
                                  onDeleteTransaction={handleDeleteTransaction}
                                  onUpdateTransaction={handleUpdateTransaction}
                                  confirmDestructive={settingsHook.settings.preferences.confirmDestructiveActions}
                                  categories={categories}
                                />
                              </Suspense>
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

                        {/* Analytics Panel - Lazy loaded */}
                        <Suspense fallback={null}>
                          <AnalyticsPanel
                            isOpen={analyticsPanelOpen}
                            onClose={() => setAnalyticsPanelOpen(false)}
                            transactions={transactions}
                            categories={categories}
                            categoryList={categoryList}
                            analytics={overallAnalytics}
                          />
                        </Suspense>
                      </div>
                    } />
    </Routes>
  );
}

export default App;