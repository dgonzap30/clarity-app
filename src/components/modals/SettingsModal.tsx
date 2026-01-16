import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign, ListFilter, Sliders, Palette, RefreshCw, Lightbulb } from 'lucide-react';
import { BudgetSettings } from '@/components/settings/BudgetSettings';
import { RulesSettings } from '@/components/settings/RulesSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { CategoriesSettings } from '@/components/settings/CategoriesSettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { SuggestionSettings } from '@/components/settings/SuggestionSettings';
import type { UseSettingsReturn } from '@/hooks/useSettings';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settingsHook: UseSettingsReturn;
  transactionCount: number;
  onClearTransactions: () => void;
}

export function SettingsModal({
  open,
  onOpenChange,
  settingsHook,
  transactionCount,
  onClearTransactions,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="categories" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex w-full overflow-x-auto justify-start sm:justify-center gap-1 scrollbar-hide">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="categories" className="mt-0 h-full">
              <CategoriesSettings settingsHook={settingsHook} />
            </TabsContent>

            <TabsContent value="budgets" className="mt-0 h-full">
              <BudgetSettings settingsHook={settingsHook} />
            </TabsContent>

            <TabsContent value="rules" className="mt-0 h-full">
              <RulesSettings settingsHook={settingsHook} />
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-0 h-full">
              <SubscriptionSettings settingsHook={settingsHook} />
            </TabsContent>

            <TabsContent value="suggestions" className="mt-0 h-full">
              <SuggestionSettings settingsHook={settingsHook} />
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 h-full">
              <PreferencesSettings
                settingsHook={settingsHook}
                transactionCount={transactionCount}
                onClearTransactions={onClearTransactions}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
