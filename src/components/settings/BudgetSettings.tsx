import { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  User,
  Wine,
  Car,
  Briefcase,
  Heart,
  Film,
  HelpCircle,
  DollarSign,
  TrendingUp,
  Home,
  ShoppingCart,
  Utensils,
  Coffee,
  Plane,
  Gift,
  Gamepad2,
  Music,
  Book,
  Dumbbell,
  Shirt,
  Smartphone,
  Wrench,
  Baby,
  PiggyBank,
  CreditCard,
  Receipt,
  Search,
} from 'lucide-react';
import type { UseSettingsReturn } from '@/hooks/useSettings';
import type { CategoryId } from '@/types';
import { useCategories } from '@/hooks/useCategories';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  User,
  Wine,
  Car,
  Briefcase,
  Heart,
  Film,
  HelpCircle,
  Home,
  ShoppingCart,
  Utensils,
  Coffee,
  Plane,
  Gift,
  Gamepad2,
  Music,
  Book,
  Dumbbell,
  Shirt,
  Smartphone,
  Wrench,
  Baby,
  PiggyBank,
  CreditCard,
  Receipt,
};

interface BudgetSettingsProps {
  settingsHook: UseSettingsReturn;
}

const QUICK_PRESETS = [5000, 10000, 15000, 20000];

export function BudgetSettings({ settingsHook }: BudgetSettingsProps) {
  const { settings, setBudget, setTotalBudget, setEnableTotalBudget, getTotalBudgetedAmount } =
    settingsHook;
  const { categoryList } = useCategories(settings);

  const [searchQuery, setSearchQuery] = useState('');

  const totalBudgeted = getTotalBudgetedAmount();
  const categories = categoryList;

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBudgetAmountChange = (categoryId: CategoryId, value: string) => {
    const amount = parseFloat(value) || 0;
    setBudget(categoryId, { amount });
  };

  const handleBudgetToggle = (categoryId: CategoryId, enabled: boolean) => {
    setBudget(categoryId, { enabled });
  };

  const handleTotalBudgetChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setTotalBudget(amount);
  };

  const handleEnableAll = () => {
    categories.forEach((category) => {
      const currentBudget = settings.budgets[category.id];
      if (!currentBudget?.enabled) {
        setBudget(category.id, { enabled: true });
      }
    });
  };

  const handleDisableAll = () => {
    categories.forEach((category) => {
      const currentBudget = settings.budgets[category.id];
      if (currentBudget?.enabled) {
        setBudget(category.id, { enabled: false });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Total Monthly Budget */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Total Monthly Budget</CardTitle>
            </div>
            <Switch
              checked={settings.enableTotalBudget}
              onCheckedChange={setEnableTotalBudget}
            />
          </div>
          <CardDescription>
            Set an overall spending cap for the month
          </CardDescription>
        </CardHeader>
        {settings.enableTotalBudget && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="total-budget" className="sr-only">
                  Total Budget Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="total-budget"
                    type="number"
                    value={settings.totalMonthlyBudget || ''}
                    onChange={(e) => handleTotalBudgetChange(e.target.value)}
                    className="pl-7"
                    placeholder="35000"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                MXN / month
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Category budgets total:{' '}
                <span className={totalBudgeted > (settings.totalMonthlyBudget || 0) ? 'text-destructive font-medium' : 'text-foreground font-medium'}>
                  {formatCurrency(totalBudgeted)}
                </span>
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Category Budgets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Category Budgets</CardTitle>
          <CardDescription>
            Configure spending limits for each category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEnableAll}>
                Enable All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisableAll}>
                Disable All
              </Button>
            </div>
          </div>

          {/* Category List */}
          {filteredCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon] || HelpCircle;
            const budget = settings.budgets[category.id] || { enabled: false, amount: 0 };

            return (
              <div
                key={category.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Category Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {category.name}
                    </div>
                    {budget.enabled && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(budget.amount)} / month
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget Toggle */}
                <Switch
                  checked={budget.enabled}
                  onCheckedChange={(checked) => handleBudgetToggle(category.id, checked)}
                />

                {/* Budget Amount */}
                {budget.enabled && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        value={budget.amount || ''}
                        onChange={(e) => handleBudgetAmountChange(category.id, e.target.value)}
                        className="pl-6 h-8 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                {budget.enabled && (
                  <div className="hidden md:flex items-center gap-1">
                    {QUICK_PRESETS.map((preset) => (
                      <Badge
                        key={preset}
                        variant={budget.amount === preset ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                        onClick={() => setBudget(category.id, { amount: preset })}
                      >
                        {preset / 1000}k
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No categories found matching "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {Object.values(settings.budgets).filter((b) => b.enabled).length}
          </span>{' '}
          categories with budgets
        </div>
        <div className="text-sm">
          Total: <span className="font-bold">{formatCurrency(totalBudgeted)}</span>
        </div>
      </div>
    </div>
  );
}
