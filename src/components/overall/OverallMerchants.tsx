import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { OverallAnalytics } from '@/hooks/useOverallAnalytics';
import { Store, Search, Trophy, Medal, Award, CreditCard } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OverallMerchantsProps {
  analytics: OverallAnalytics;
}

export function OverallMerchants({ analytics }: OverallMerchantsProps) {
  const { merchantRankings, totalSpending } = analytics;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter merchants by search
  const filteredMerchants = useMemo(() => {
    if (!searchQuery.trim()) return merchantRankings;
    const query = searchQuery.toLowerCase();
    return merchantRankings.filter((m) =>
      m.merchant.toLowerCase().includes(query)
    );
  }, [merchantRankings, searchQuery]);

  // Top 10 for chart
  const topMerchantsChart = useMemo(() => {
    return merchantRankings.slice(0, 10).map((m) => ({
      name: m.merchant.length > 15 ? m.merchant.slice(0, 15) + '...' : m.merchant,
      fullName: m.merchant,
      total: m.totalSpent,
    }));
  }, [merchantRankings]);

  // Max amount for progress bars
  const maxAmount = merchantRankings.length > 0 ? merchantRankings[0].totalSpent : 1;

  if (merchantRankings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No merchant data available
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="h-5 w-5 flex items-center justify-center text-xs font-bold text-muted-foreground">
            #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Merchants Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-[hsl(var(--accent-green))]" />
            Top 10 Merchants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMerchantsChart} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), 'Total']}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullName || label
                  }
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="#06D6A0"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Merchant Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Merchant Leaderboard</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredMerchants.slice(0, 50).map((merchant) => {
              const originalIndex = merchantRankings.indexOf(merchant);
              return (
                <div
                  key={merchant.merchant}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankIcon(originalIndex)}
                  </div>

                  {/* Merchant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{merchant.merchant}</span>
                      {merchant.category && (
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
                      )}
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={(merchant.totalSpent / maxAmount) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{merchant.transactionCount} transactions</span>
                      <span>Avg: {formatCurrency(merchant.averageTransaction)}</span>
                      <span>Last: {formatDate(merchant.lastTransaction)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg">{formatCurrency(merchant.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">
                      {merchant.percentOfTotal.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredMerchants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No merchants found matching "{searchQuery}"
              </div>
            )}

            {filteredMerchants.length > 50 && (
              <p className="text-sm text-muted-foreground text-center pt-4">
                Showing 50 of {filteredMerchants.length} merchants
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <Store className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unique Merchants</p>
                <p className="text-lg font-bold">{merchantRankings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <Trophy className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top Merchant</p>
                <p className="text-sm font-bold truncate max-w-[120px]">
                  {merchantRankings[0]?.merchant || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top 5 Total</p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    merchantRankings.slice(0, 5).reduce((sum, m) => sum + m.totalSpent, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-accent-subtle flex items-center justify-center">
                <Store className="h-5 w-5 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top 5 Share</p>
                <p className="text-lg font-bold">
                  {(
                    (merchantRankings.slice(0, 5).reduce((sum, m) => sum + m.totalSpent, 0) /
                      totalSpending) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
