import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverallSummary } from './OverallSummary';
import { OverallTrends } from './OverallTrends';
import { OverallCategories } from './OverallCategories';
import { OverallMerchants } from './OverallMerchants';
import type { Transaction, Category } from '@/types';
import type { OverallAnalytics } from '@/hooks/useOverallAnalytics';
import { BarChart3, TrendingUp, PieChart, Store } from 'lucide-react';

interface OverallTabProps {
  transactions: Transaction[];
  categories: Record<string, Category>;
  categoryList: Category[];
  analytics: OverallAnalytics;
}

export function OverallTab({
  transactions: _transactions,
  categories,
  categoryList,
  analytics,
}: OverallTabProps) {
  // _transactions is available but analytics already contains aggregated data
  void _transactions;
  return (
    <Tabs defaultValue="summary" className="space-y-6">
      <TabsList className="w-full grid grid-cols-4 max-w-lg mx-auto">
        <TabsTrigger value="summary" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Summary</span>
        </TabsTrigger>
        <TabsTrigger value="trends" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Trends</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="gap-2">
          <PieChart className="h-4 w-4" />
          <span className="hidden sm:inline">Categories</span>
        </TabsTrigger>
        <TabsTrigger value="merchants" className="gap-2">
          <Store className="h-4 w-4" />
          <span className="hidden sm:inline">Merchants</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-6">
        <OverallSummary analytics={analytics} />
      </TabsContent>

      <TabsContent value="trends" className="space-y-6">
        <OverallTrends analytics={analytics} categories={categories} categoryList={categoryList} />
      </TabsContent>

      <TabsContent value="categories" className="space-y-6">
        <OverallCategories analytics={analytics} categoryList={categoryList} />
      </TabsContent>

      <TabsContent value="merchants" className="space-y-6">
        <OverallMerchants analytics={analytics} />
      </TabsContent>
    </Tabs>
  );
}
