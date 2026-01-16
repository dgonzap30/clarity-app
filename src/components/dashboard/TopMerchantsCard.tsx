import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { Store, Trophy, Medal, Award, ExternalLink } from 'lucide-react';
import type { Transaction } from '@/types';

interface TopMerchantsCardProps {
  transactions: Transaction[];
  month: Date;
  limit?: number; // Default: 5
  onViewAll?: (merchant?: string) => void;
}

interface MerchantData {
  merchant: string;
  totalSpent: number;
  transactionCount: number;
  category: {
    name: string;
    color: string;
  };
  percentOfTotal: number;
}

export function TopMerchantsCard({
  transactions,
  month,
  limit = 5,
  onViewAll,
}: TopMerchantsCardProps) {
  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.date.getMonth() === month.getMonth() &&
        t.date.getFullYear() === month.getFullYear()
    );
  }, [transactions, month]);

  // Calculate top merchants
  const topMerchants = useMemo(() => {
    // Group by merchant
    const merchantMap = new Map<string, MerchantData>();
    const totalSpending = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    monthTransactions.forEach((t) => {
      const existing = merchantMap.get(t.merchant) || {
        merchant: t.merchant,
        totalSpent: 0,
        transactionCount: 0,
        category: {
          name: t.category.name,
          color: t.category.color,
        },
        percentOfTotal: 0,
      };

      existing.totalSpent += t.amount;
      existing.transactionCount += 1;
      merchantMap.set(t.merchant, existing);
    });

    // Convert to array, calculate percentages, and sort
    const merchants = Array.from(merchantMap.values()).map((m) => ({
      ...m,
      percentOfTotal: totalSpending > 0 ? (m.totalSpent / totalSpending) * 100 : 0,
    }));

    merchants.sort((a, b) => b.totalSpent - a.totalSpent);

    return merchants.slice(0, limit);
  }, [monthTransactions, limit]);

  // Get rank icon
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return (
          <span className="h-4 w-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
            #{index + 1}
          </span>
        );
    }
  };

  if (topMerchants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-[hsl(var(--accent-green))]" />
            Top Merchants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transactions this month</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-[hsl(var(--accent-green))]" />
            Top Merchants
          </CardTitle>
          {onViewAll && (
            <button
              onClick={() => onViewAll()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View All
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topMerchants.map((merchant, index) => (
            <div
              key={merchant.merchant}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onViewAll?.(merchant.merchant)}
            >
              {/* Rank */}
              <div className="w-6 flex justify-center shrink-0">
                {getRankIcon(index)}
              </div>

              {/* Merchant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold truncate text-sm">
                    {merchant.merchant}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs shrink-0"
                    style={{
                      backgroundColor: `${merchant.category.color}20`,
                      color: merchant.category.color,
                    }}
                  >
                    {merchant.category.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{merchant.transactionCount} transactions</span>
                  <span>•</span>
                  <span>{merchant.percentOfTotal.toFixed(1)}% of total</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-bold text-sm sm:text-base tabular-nums">
                  {formatCurrency(merchant.totalSpent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
