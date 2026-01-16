import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Tags, Filter, Sparkles } from 'lucide-react';
import { EmptyStateCompact } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { Transaction, Category } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { format } from 'date-fns';
import { generateSuggestions, type CategorySuggestion } from '@/lib/suggestion-engine';
import { useSettings } from '@/hooks/useSettings';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: Date;
  onDeleteTransaction?: (id: string) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  confirmDestructive?: boolean;
  categories: Record<string, Category>;
}

type SortField = 'date' | 'amount' | 'category' | 'merchant';
type SortDirection = 'asc' | 'desc';

export function TransactionList({
  transactions,
  selectedMonth,
  onDeleteTransaction,
  onUpdateTransaction,
  confirmDestructive = true,
  categories,
}: TransactionListProps) {
  const categoryList = useMemo(() => Object.values(categories), [categories]);
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryDialogOpen, setBulkCategoryDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Mobile filter expansion state
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Get unique categories from transactions
  const availableCategories = useMemo(() => {
    const categorySet = new Set(transactions.map(t => t.category.id));
    return categoryList.filter(c => categorySet.has(c.id));
  }, [transactions, categoryList]);

  // Toggle category filter
  const toggleCategory = (categoryId: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedCategories(newSet);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleMobileSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
  };

  const sortedAndFilteredTransactions = useMemo(() => {
    // First filter
    const filtered = transactions.filter((t) => {
      // Category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(t.category.id)) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !t.descripcion.toLowerCase().includes(searchLower) &&
          !t.merchant.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name);
          break;
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [transactions, search, selectedCategories, sortField, sortDirection]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedAndFilteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredTransactions, currentPage]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = sortedAndFilteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = sortedAndFilteredTransactions.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [sortedAndFilteredTransactions]);

  const handleDeleteClick = (transaction: Transaction) => {
    if (confirmDestructive) {
      setTransactionToDelete(transaction);
      setDeleteDialogOpen(true);
    } else {
      // Delete immediately without confirmation
      if (onDeleteTransaction) {
        onDeleteTransaction(transaction.id);
      }
    }
  };

  const confirmDelete = () => {
    if (transactionToDelete && onDeleteTransaction) {
      onDeleteTransaction(transactionToDelete.id);
    }
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const handleCategoryChange = (transactionId: string, newCategoryId: string) => {
    if (onUpdateTransaction) {
      const newCategory = categories[newCategoryId];
      if (newCategory) {
        onUpdateTransaction(transactionId, { category: newCategory });
      }
    }
  };

  // Batch selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTransactions.map(t => t.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkCategoryChange = (newCategoryId: string) => {
    if (onUpdateTransaction) {
      const newCategory = categories[newCategoryId];
      if (newCategory) {
        selectedIds.forEach(id => {
          onUpdateTransaction(id, { category: newCategory });
        });
      }
    }
    setSelectedIds(new Set());
    setBulkCategoryDialogOpen(false);
  };

  const handleBulkDelete = () => {
    if (onDeleteTransaction) {
      selectedIds.forEach(id => {
        onDeleteTransaction(id);
      });
    }
    setSelectedIds(new Set());
    setBulkDeleteDialogOpen(false);
  };

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [search, selectedCategories, currentPage]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  // Generate suggestions for a transaction
  const getSuggestionsForTransaction = (transaction: Transaction): CategorySuggestion[] => {
    if (!settings.suggestionSettings.enableSuggestions) {
      return [];
    }

    // Filter out current transaction to avoid self-reference
    const otherTransactions = transactions.filter(t => t.id !== transaction.id);

    return generateSuggestions(
      transaction.merchant,
      transaction.amount,
      otherTransactions,
      settings.learnedPatterns,
      settings.suggestionSettings
    );
  };

  // Render category select with suggestions
  const CategorySelect = ({ transaction }: { transaction: Transaction }) => {
    const suggestions = getSuggestionsForTransaction(transaction);

    return (
      <Select
        value={transaction.category.id}
        onValueChange={(value) => handleCategoryChange(transaction.id, value)}
      >
        <SelectTrigger className="h-7 w-auto border-0 bg-transparent p-0 focus:ring-0">
          <Badge className={`${transaction.category.bgColor} ${transaction.category.textColor} border-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}>
            {transaction.category.name}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[hsl(var(--accent-green))]" />
                Suggested
              </div>
              {suggestions.map((suggestion) => {
                const cat = categories[suggestion.categoryId];
                if (!cat) return null;

                return (
                  <SelectItem
                    key={`suggestion-${cat.id}`}
                    value={cat.id}
                    className="bg-accent/5 hover:bg-accent/10"
                  >
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium text-[hsl(var(--accent-green))]">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
              <div className="h-px bg-border my-1" />
            </>
          )}

          {/* All Categories */}
          {categoryList.map((cat) => (
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
    );
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-6">
        <div className="space-y-4">
          <CardTitle className="text-lg">{format(selectedMonth, 'MMMM yyyy')} Transactions</CardTitle>

          {/* Summary Stats - Hero Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(summaryStats.total)}</div>
            </div>
            <div className="space-y-1 border-x px-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Count</div>
              <div className="text-2xl sm:text-3xl font-bold">{summaryStats.count}</div>
              <div className="text-xs text-muted-foreground">transaction{summaryStats.count !== 1 ? 's' : ''}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Average</div>
              <div className="text-2xl sm:text-3xl font-bold">{formatCurrency(summaryStats.average)}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0 space-y-4">
        {/* Filters Section */}
        <div className="space-y-3 pt-4 border-t">
          {/* Mobile: Collapsible filter toggle */}
          <button
            className="flex sm:hidden items-center justify-between w-full p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Filters{selectedCategories.size > 0 ? ` (${selectedCategories.size} active)` : ''}
              </span>
            </div>
            {filtersExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Filter content - collapsible on mobile */}
          <div className={cn(
            "space-y-3",
            // Mobile: Animated collapse
            "sm:block",
            filtersExpanded ? "block" : "hidden sm:block"
          )}>
            {/* Category Filters */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium hidden sm:block">
                Filter by Category{selectedCategories.size > 0 ? ` (${selectedCategories.size})` : ''}:
              </div>
              {selectedCategories.size > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategories(new Set())}>
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.has(category.id) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    selectedCategories.has(category.id)
                      ? `${category.bgColor} ${category.textColor} border-0`
                      : ''
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search - always visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium">
              {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              {onUpdateTransaction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkCategoryDialogOpen(true)}
                  className="gap-2"
                >
                  <Tags className="h-4 w-4" />
                  Categorize
                </Button>
              )}
              {onDeleteTransaction && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t" />

        {/* Transaction List */}
        {sortedAndFilteredTransactions.length === 0 ? (
          <div className="py-4">
            <EmptyStateCompact
              variant={search || selectedCategories.size > 0 ? 'no-results' : 'no-transactions'}
              title={search || selectedCategories.size > 0 ? 'No matches found' : 'A fresh start this month'}
              description={
                search || selectedCategories.size > 0
                  ? 'Try adjusting your filters to discover more transactions.'
                  : 'No transactions recorded yet. Your story begins with the first entry!'
              }
            />
            {(search || selectedCategories.size > 0) && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategories(new Set());
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile sort controls */}
            <div className="flex sm:hidden items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={`${sortField}-${sortDirection}`} onValueChange={handleMobileSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-desc">Amount (High)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low)</SelectItem>
                  <SelectItem value="merchant-asc">Merchant (A-Z)</SelectItem>
                  <SelectItem value="merchant-desc">Merchant (Z-A)</SelectItem>
                  <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                  <SelectItem value="category-desc">Category (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile card view */}
            <div className="block sm:hidden space-y-3">
              {paginatedTransactions.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "rounded-lg border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-all active:bg-muted/30",
                    selectedIds.has(t.id) && "ring-2 ring-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    {/* Checkbox for batch selection */}
                    {(onDeleteTransaction || onUpdateTransaction) && (
                      <Checkbox
                        checked={selectedIds.has(t.id)}
                        onCheckedChange={() => toggleSelectOne(t.id)}
                        className="mt-1 h-5 w-5"
                        aria-label={`Select transaction: ${t.merchant}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{t.merchant}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.location}</div>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                      <span className={`font-mono ${t.amount > 1000 ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {formatCurrency(t.amount)}
                      </span>
                      {onDeleteTransaction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(t);
                          }}
                          aria-label={`Delete transaction: ${t.merchant}`}
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{formatDate(t.date)}</span>
                    {onUpdateTransaction ? (
                      <CategorySelect transaction={t} />
                    ) : (
                      <Badge className={`${t.category.bgColor} ${t.category.textColor} border-0`}>
                        {t.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {(onDeleteTransaction || onUpdateTransaction) && (
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selectedIds.size === paginatedTransactions.length && paginatedTransactions.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all transactions on this page"
                        />
                      </TableHead>
                    )}
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        <SortIcon field="date" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      onClick={() => handleSort('merchant')}
                    >
                      <div className="flex items-center">
                        Description
                        <SortIcon field="merchant" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        <SortIcon field="category" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors text-right select-none"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        <SortIcon field="amount" />
                      </div>
                    </TableHead>
                    {onDeleteTransaction && <TableHead className="w-[50px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((t, index) => (
                    <TableRow
                      key={t.id}
                      className={cn(
                        "group hover:bg-muted/50 transition-colors",
                        selectedIds.has(t.id) ? 'bg-primary/5' : '',
                        // Zebra striping
                        index % 2 === 1 && !selectedIds.has(t.id) && 'bg-muted/20'
                      )}
                    >
                      {(onDeleteTransaction || onUpdateTransaction) && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(t.id)}
                            onCheckedChange={() => toggleSelectOne(t.id)}
                            aria-label={`Select transaction: ${t.merchant}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{formatDate(t.date)}</TableCell>
                      <TableCell className="max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-none">
                        <div className="font-medium truncate">{t.merchant}</div>
                        <div className="text-xs text-muted-foreground truncate">{t.location}</div>
                      </TableCell>
                      <TableCell>
                        {onUpdateTransaction ? (
                          <CategorySelect transaction={t} />
                        ) : (
                          <Badge className={`${t.category.bgColor} ${t.category.textColor} border-0`}>
                            {t.category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono ${t.amount > 1000 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {formatCurrency(t.amount)}
                        </span>
                      </TableCell>
                      {onDeleteTransaction && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 group-hover:text-muted-foreground transition-colors"
                            onClick={() => handleDeleteClick(t)}
                            aria-label={`Delete transaction: ${t.merchant}`}
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Pagination */}
        {sortedAndFilteredTransactions.length > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t bg-muted/30">
            <div className="text-sm font-medium">
              <span className="hidden sm:inline">Showing </span>
              <span className="font-bold text-foreground">
                {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedAndFilteredTransactions.length)}
              </span>
              <span className="hidden sm:inline text-muted-foreground"> of </span>
              <span className="sm:hidden text-muted-foreground"> / </span>
              <span className="font-bold text-foreground">{sortedAndFilteredTransactions.length}</span>
              <span className="hidden sm:inline text-muted-foreground"> transaction{sortedAndFilteredTransactions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <div className="text-sm font-medium px-2">
                Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {sortedAndFilteredTransactions.length > 0 && sortedAndFilteredTransactions.length <= ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 py-4 border-t bg-muted/30">
            <div className="text-sm">
              <span className="font-bold text-foreground text-base">{sortedAndFilteredTransactions.length}</span>
              <span className="text-muted-foreground ml-2">transaction{sortedAndFilteredTransactions.length !== 1 ? 's' : ''} total</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {transactionToDelete && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Merchant:</span>
                <span className="font-medium">{transactionToDelete.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">{formatCurrency(transactionToDelete.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="font-medium">{formatDate(transactionToDelete.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge className={`${transactionToDelete.category.bgColor} ${transactionToDelete.category.textColor} border-0`}>
                  {transactionToDelete.category.name}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Category Change Dialog */}
      <Dialog open={bulkCategoryDialogOpen} onOpenChange={setBulkCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Category</DialogTitle>
            <DialogDescription>
              Select a new category for {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-2">
            {categoryList.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleBulkCategoryChange(cat.id)}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkCategoryDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedIds.size} Transaction{selectedIds.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
