/**
 * RulePreview - Shows which transactions would match a rule
 * Used when creating or editing categorization rules
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '@/types';
import type { CustomCategorizationRule } from '@/types/settings';
import { fuzzyPatternMatch } from '@/lib/fuzzy-match';

interface RulePreviewProps {
  rule: Partial<CustomCategorizationRule>;
  transactions: Transaction[];
  maxResults?: number;
}

export function RulePreview({ rule, transactions, maxResults = 10 }: RulePreviewProps) {
  // Find transactions that would match this rule
  const matchingTransactions = useMemo(() => {
    if (!rule.pattern) return [];

    return transactions.filter((tx) => {
      // Check amount filters
      if (rule.minAmount !== undefined && tx.amount < rule.minAmount) return false;
      if (rule.maxAmount !== undefined && tx.amount > rule.maxAmount) return false;

      // Check exclude patterns
      if (rule.excludePatterns && rule.excludePatterns.length > 0) {
        const shouldExclude = rule.excludePatterns.some((excludePattern) => {
          const descCheck = rule.caseSensitive
            ? tx.descripcion
            : tx.descripcion.toLowerCase();
          const patternCheck = rule.caseSensitive
            ? excludePattern
            : excludePattern.toLowerCase();
          return descCheck.includes(patternCheck);
        });
        if (shouldExclude) return false;
      }

      // Check main pattern
      if (rule.isRegex && rule.pattern) {
        try {
          const flags = rule.caseSensitive ? '' : 'i';
          const regex = new RegExp(rule.pattern, flags);
          return regex.test(tx.descripcion);
        } catch {
          return false;
        }
      } else if (rule.pattern) {
        const descCheck = rule.caseSensitive
          ? tx.descripcion
          : tx.descripcion.toLowerCase();
        const patternCheck = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();

        switch (rule.matchType) {
          case 'exact':
            return descCheck === patternCheck;
          case 'startsWith':
            return descCheck.startsWith(patternCheck);
          case 'endsWith':
            return descCheck.endsWith(patternCheck);
          case 'fuzzy':
            return fuzzyPatternMatch(tx.descripcion, rule.pattern, 0.75);
          case 'contains':
          default:
            return descCheck.includes(patternCheck);
        }
      }

      return false;
    });
  }, [rule, transactions]);

  const totalMatches = matchingTransactions.length;
  const previewTransactions = matchingTransactions.slice(0, maxResults);

  if (!rule.pattern) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground text-sm py-8">
            Enter a pattern to preview matching transactions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Preview</CardTitle>
          <div className="flex items-center gap-2">
            {totalMatches > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--accent-green))]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-sm font-semibold">
              {totalMatches} match{totalMatches !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalMatches === 0 ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div className="text-sm text-amber-600 dark:text-amber-400">
              No transactions match this pattern. Try adjusting your rule or check that the pattern is correct.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {previewTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-medium truncate">{tx.merchant}</div>
                  <div className="text-xs text-muted-foreground truncate">{tx.descripcion}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="font-mono text-sm font-medium">{formatCurrency(tx.amount)}</span>
                  <Badge className={`${tx.category.bgColor} ${tx.category.textColor} border-0`}>
                    {tx.category.name}
                  </Badge>
                </div>
              </div>
            ))}
            {totalMatches > maxResults && (
              <div className="text-center text-sm text-muted-foreground py-2">
                +{totalMatches - maxResults} more transaction{totalMatches - maxResults !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
