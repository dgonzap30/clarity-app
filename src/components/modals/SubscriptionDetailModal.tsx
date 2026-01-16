import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubscriptionStatusBadge } from '@/components/subscriptions/SubscriptionStatusBadge';
import { ConfidenceBar } from '@/components/subscriptions/ConfidenceBar';
import type { Transaction, Category } from '@/types';
import type { Subscription } from '@/types/subscription';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getServiceLogo } from '@/lib/service-logos';
import { KNOWN_SERVICES } from '@/lib/subscription-detector';
import {
  getSubscriptionTransactions,
  calculateSubscriptionAnalytics,
  detectPriceChanges,
  getDetectionExplanation,
  formatFrequency,
  getDaysUntilRenewal,
  formatDuration,
  normalizeToMonthly,
} from '@/lib/subscription-analytics';
import {
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Pause,
  XCircle,
  Tag,
  BarChart3,
  History,
  Info,
  Tv,
  Music,
  Bot,
  Cloud,
  Heart,
  Car,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

// Icon map for services
const iconMap: Record<string, typeof Tv> = {
  Tv,
  Music,
  Bot,
  Cloud,
  Heart,
  Car,
  Package,
  CreditCard,
};

interface SubscriptionDetailModalProps {
  subscription: Subscription | null;
  transactions: Transaction[];
  categories: Record<string, Category>;
  onClose: () => void;
  onUpdate: (subscriptionId: string, updates: Partial<Subscription>) => void;
  onCancel: (subscriptionId: string) => void;
  onRemove: (subscriptionId: string) => void;
}

export function SubscriptionDetailModal({
  subscription,
  transactions,
  categories,
  onClose,
  onUpdate,
  onCancel,
  onRemove,
}: SubscriptionDetailModalProps) {
  const [logoError, setLogoError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Get subscription transactions
  const subTransactions = useMemo(() => {
    if (!subscription) return [];
    return getSubscriptionTransactions(subscription, transactions);
  }, [subscription, transactions]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!subscription) return null;
    return calculateSubscriptionAnalytics(subscription, transactions);
  }, [subscription, transactions]);

  // Detect price changes
  const priceChanges = useMemo(() => {
    if (!subscription) return [];
    return detectPriceChanges(subscription, transactions, 5);
  }, [subscription, transactions]);

  // Get chart data for cost trend
  const chartData = useMemo(() => {
    if (!subTransactions.length) return [];
    const sorted = [...subTransactions].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return sorted.map((t) => ({
      date: format(t.date, 'MMM yyyy'),
      amount: t.amount,
      fullDate: t.date,
    }));
  }, [subTransactions]);

  if (!subscription) return null;

  const logoUrl = getServiceLogo(subscription.knownServiceId);
  const daysUntil = getDaysUntilRenewal(subscription);
  const knownService = subscription.knownServiceId
    ? KNOWN_SERVICES.find((s) => s.id === subscription.knownServiceId)
    : null;
  const Icon =
    knownService?.icon && iconMap[knownService.icon]
      ? iconMap[knownService.icon]
      : CreditCard;
  const category = categories[subscription.categoryId];

  // Most recent price change
  const latestPriceChange = priceChanges.length > 0 ? priceChanges[priceChanges.length - 1] : null;

  const handleCategoryChange = (categoryId: string) => {
    onUpdate(subscription.id, { categoryId: categoryId as any });
  };

  const handlePauseToggle = () => {
    const newStatus = subscription.status === 'paused' ? 'active' : 'paused';
    onUpdate(subscription.id, { status: newStatus });
  };

  const handleMarkCancelled = () => {
    onCancel(subscription.id);
    onClose();
  };

  const handleRemove = () => {
    onRemove(subscription.id);
    onClose();
  };

  return (
    <Dialog open={!!subscription} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-accent-subtle flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={subscription.name}
                  className="h-7 w-7 rounded object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Icon className="h-6 w-6 text-[hsl(var(--accent-green))]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate">{subscription.name}</span>
                <SubscriptionStatusBadge status={subscription.status} size="sm" />
              </div>
              {category && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                </div>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Subscription details for {subscription.name}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Cost Summary */}
            <div className="p-4 bg-muted/50 rounded-xl space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-bold">
                    {formatCurrency(subscription.amount)}
                  </span>
                  <span className="text-lg text-muted-foreground ml-1">
                    /{formatFrequency(subscription.frequency)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Monthly</span>
                  <p className="font-semibold">
                    {formatCurrency(normalizeToMonthly(subscription.amount, subscription.frequency))}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Annual</span>
                  <p className="font-semibold">
                    {formatCurrency(normalizeToMonthly(subscription.amount, subscription.frequency) * 12)}
                  </p>
                </div>
              </div>

              {daysUntil !== null && subscription.status === 'active' && (
                <div className="flex items-center gap-2 pt-3 border-t text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Next renewal:{' '}
                    <span className="font-medium">
                      {formatDate(new Date(subscription.nextExpectedDate!))}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      ({daysUntil} day{daysUntil !== 1 ? 's' : ''})
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Detection Info */}
            <div className="p-4 bg-muted/30 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Detection Details
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <Badge variant="secondary" className="capitalize">
                    {subscription.detectionMethod.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">
                      {Math.round(subscription.confidence * 100)}%
                    </span>
                  </div>
                  <ConfidenceBar confidence={subscription.confidence} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pattern</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {subscription.merchantPattern}
                  </code>
                </div>

                {analytics?.firstChargeDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">First detected</span>
                    <span>{format(analytics.firstChargeDate, 'MMM yyyy')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Matched transactions</span>
                  <span>{subscription.transactionIds.length}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-2 border-t">
                {getDetectionExplanation(subscription)}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseToggle}
                  className="gap-2"
                >
                  <Pause className="h-4 w-4" />
                  {subscription.status === 'paused' ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkCancelled}
                  className="gap-2"
                  disabled={subscription.status === 'cancelled'}
                >
                  <XCircle className="h-4 w-4" />
                  Mark Cancelled
                </Button>
                <Select
                  value={subscription.categoryId}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(categories).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm" onClick={handleRemove} className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {/* Price Change Alert */}
            {latestPriceChange && (
              <div
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  latestPriceChange.percentChange > 0
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-success/10 text-success'
                }`}
              >
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">
                    Price {latestPriceChange.percentChange > 0 ? 'increase' : 'decrease'} detected
                  </p>
                  <p className="mt-1">
                    {formatCurrency(latestPriceChange.previousAmount)} →{' '}
                    {formatCurrency(latestPriceChange.newAmount)} (
                    {latestPriceChange.percentChange > 0 ? '+' : ''}
                    {latestPriceChange.percentChange.toFixed(1)}%) in{' '}
                    {format(latestPriceChange.date, 'MMM yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            {subTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for this subscription
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subTransactions.slice(0, 20).map((t) => {
                      const priceChange = priceChanges.find(
                        (pc) => pc.transactionId === t.id
                      );
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">
                            {formatDate(t.date)}
                          </TableCell>
                          <TableCell>
                            <div className="truncate max-w-[200px]">{t.merchant}</div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell>
                            {priceChange && (
                              <div
                                className={`flex items-center gap-1 text-xs ${
                                  priceChange.percentChange > 0
                                    ? 'text-destructive'
                                    : 'text-success'
                                }`}
                              >
                                {priceChange.percentChange > 0 ? (
                                  <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3" />
                                )}
                                {Math.abs(priceChange.percentChange).toFixed(0)}%
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {subTransactions.length > 20 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing 20 of {subTransactions.length} transactions
              </p>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Cost Trend Chart */}
            {chartData.length > 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Cost Trend</h4>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        width={60}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), 'Amount']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      />
                      <Area
                        type="stepAfter"
                        dataKey="amount"
                        stroke="#06D6A0"
                        strokeWidth={2}
                        fill="url(#colorAmount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Lifetime Spend</div>
                  <div className="text-lg font-bold mt-1">
                    {formatCurrency(analytics.totalLifetimeSpend)}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Average</div>
                  <div className="text-lg font-bold mt-1">
                    {formatCurrency(analytics.averageAmount)}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Charges</div>
                  <div className="text-lg font-bold mt-1">{analytics.chargeCount}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="text-lg font-bold mt-1">
                    {analytics.subscriptionDurationDays > 0
                      ? formatDuration(analytics.subscriptionDurationDays)
                      : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* Price Stability */}
            {analytics && (
              <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Price Stability</h4>
                  <span className="text-sm font-medium">
                    {Math.round(analytics.priceStabilityScore * 100)}%
                  </span>
                </div>
                <Progress
                  value={analytics.priceStabilityScore * 100}
                  status={
                    analytics.priceStabilityScore >= 0.9
                      ? 'success'
                      : analytics.priceStabilityScore >= 0.7
                      ? 'warning'
                      : 'danger'
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {analytics.priceStabilityScore >= 0.9
                    ? 'Highly stable pricing with minimal variation'
                    : analytics.priceStabilityScore >= 0.7
                    ? 'Mostly stable with some price variations'
                    : 'Variable pricing - amounts change frequently'}
                </p>
              </div>
            )}

            {/* Price Change History */}
            {priceChanges.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Price Changes</h4>
                <div className="space-y-2">
                  {priceChanges.map((change, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                        change.percentChange > 0
                          ? 'bg-destructive/10'
                          : 'bg-success/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {change.percentChange > 0 ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-success" />
                        )}
                        <span>{format(change.date, 'MMM yyyy')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">
                          {formatCurrency(change.previousAmount)} →{' '}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(change.newAmount)}
                        </span>
                        <span
                          className={`ml-2 ${
                            change.percentChange > 0
                              ? 'text-destructive'
                              : 'text-success'
                          }`}
                        >
                          ({change.percentChange > 0 ? '+' : ''}
                          {change.percentChange.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {priceChanges.length === 0 && chartData.length <= 1 && (
              <div className="text-center py-8 text-muted-foreground">
                Not enough transaction data for analytics
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
