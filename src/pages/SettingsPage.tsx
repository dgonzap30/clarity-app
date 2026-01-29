import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetSettings } from "@/components/settings/BudgetSettings";
import { CategoriesSettings } from "@/components/settings/CategoriesSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { RulesSettings } from "@/components/settings/RulesSettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import type { Transaction } from "@/types";
import type { UserSettings } from "@/types/settings";
import type { UseSettingsReturn } from "@/hooks/useSettings";

interface SettingsPageProps {
  settingsHook: UseSettingsReturn;
  transactionCount: number;
  onClearTransactions: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  transactions: Transaction[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onImportData: (transactions: Transaction[], settings: UserSettings) => void;
}

export const SettingsPage = ({
  settingsHook,
  transactionCount,
  onClearTransactions,
  onAddTransaction: _onAddTransaction,
  transactions: _transactions,
  onUpdateTransaction: _onUpdateTransaction,
  onImportData: _onImportData,
}: SettingsPageProps) => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Tabs defaultValue="preferences" className="space-y-8">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <PreferencesSettings
            settingsHook={settingsHook}
            transactionCount={transactionCount}
            onClearTransactions={onClearTransactions}
          />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetSettings settingsHook={settingsHook} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesSettings settingsHook={settingsHook} />
        </TabsContent>

        <TabsContent value="rules">
          <RulesSettings settingsHook={settingsHook} />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionSettings settingsHook={settingsHook} />
        </TabsContent>
      </Tabs>
    </div>
  );
};