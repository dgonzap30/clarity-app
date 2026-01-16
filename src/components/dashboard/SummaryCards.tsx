import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { Transaction } from '@/types';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const averageTransaction = totalSpending / totalTransactions || 0;

  const months = new Set(
    transactions.map(t => `${t.date.getFullYear()}-${t.date.getMonth()}`)
  );
  const monthsTracked = months.size;
  const monthlyAverage = totalSpending / monthsTracked || 0;

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(totalSpending),
      icon: DollarSign,
      description: 'All time total',
    },
    {
      title: 'Transactions',
      value: totalTransactions.toString(),
      icon: CreditCard,
      description: `${monthsTracked} months tracked`,
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(averageTransaction),
      icon: TrendingUp,
      description: 'Per transaction',
    },
    {
      title: 'Monthly Average',
      value: formatCurrency(monthlyAverage),
      icon: Calendar,
      description: 'Per month',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} variant="default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
