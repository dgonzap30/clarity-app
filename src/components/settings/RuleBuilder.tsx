/**
 * RuleBuilder - Wizard for creating custom categorization rules
 * Provides step-by-step interface with live preview
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RulePreview } from './RulePreview';
import { AlertCircle, Plus, X } from 'lucide-react';
import type { Transaction, Category } from '@/types';
import type { CustomCategorizationRule } from '@/types/settings';

interface RuleBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rule: Omit<CustomCategorizationRule, 'id' | 'createdAt' | 'matchCount'>) => void;
  categories: Category[];
  transactions: Transaction[];
  existingRule?: CustomCategorizationRule;
}

export function RuleBuilder({
  open,
  onOpenChange,
  onSave,
  categories,
  transactions,
  existingRule,
}: RuleBuilderProps) {
  const [pattern, setPattern] = useState(existingRule?.pattern || '');
  const [isRegex, setIsRegex] = useState(existingRule?.isRegex || false);
  const [categoryId, setCategoryId] = useState(existingRule?.categoryId || 'uncategorized');
  const [priority, setPriority] = useState(existingRule?.priority || 50);
  const [matchType, setMatchType] = useState<'contains' | 'startsWith' | 'endsWith' | 'exact' | 'fuzzy' | undefined>(
    existingRule?.matchType || 'contains'
  );
  const [caseSensitive, setCaseSensitive] = useState(existingRule?.caseSensitive || false);
  const [minAmount, setMinAmount] = useState(existingRule?.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState(existingRule?.maxAmount?.toString() || '');
  const [excludePatterns, setExcludePatterns] = useState<string[]>(
    existingRule?.excludePatterns || []
  );
  const [newExcludePattern, setNewExcludePattern] = useState('');

  const handleSave = () => {
    if (!pattern.trim()) {
      return;
    }

    const rule: Omit<CustomCategorizationRule, 'id' | 'createdAt' | 'matchCount'> = {
      pattern: pattern.trim(),
      isRegex,
      categoryId,
      priority,
      matchType,
      caseSensitive,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      excludePatterns: excludePatterns.length > 0 ? excludePatterns : undefined,
    };

    onSave(rule);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setPattern('');
    setIsRegex(false);
    setCategoryId('uncategorized');
    setPriority(50);
    setMatchType('contains');
    setCaseSensitive(false);
    setMinAmount('');
    setMaxAmount('');
    setExcludePatterns([]);
    setNewExcludePattern('');
    onOpenChange(false);
  };

  const addExcludePattern = () => {
    if (newExcludePattern.trim()) {
      setExcludePatterns([...excludePatterns, newExcludePattern.trim()]);
      setNewExcludePattern('');
    }
  };

  const removeExcludePattern = (index: number) => {
    setExcludePatterns(excludePatterns.filter((_, i) => i !== index));
  };

  // Build preview rule
  const previewRule: Partial<CustomCategorizationRule> = {
    pattern,
    isRegex,
    categoryId,
    priority,
    matchType,
    caseSensitive,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    excludePatterns: excludePatterns.length > 0 ? excludePatterns : undefined,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingRule ? 'Edit Rule' : 'Create Categorization Rule'}</DialogTitle>
          <DialogDescription>
            Define a pattern to automatically categorize transactions. Changes will apply to future uploads.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Pattern */}
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <Input
                id="pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g., STARBUCKS, NETFLIX, etc."
              />
              <p className="text-xs text-muted-foreground">
                Text or pattern to match in transaction descriptions
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Assign to Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Match Type */}
            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type</Label>
              <Select
                value={matchType || 'contains'}
                onValueChange={(value) => setMatchType(value as typeof matchType)}
              >
                <SelectTrigger id="matchType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains (default)</SelectItem>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="endsWith">Ends With</SelectItem>
                  <SelectItem value="fuzzy">Fuzzy Match</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {matchType === 'fuzzy' && 'Matches similar text (handles typos)'}
                {matchType === 'exact' && 'Matches only if identical'}
                {matchType === 'contains' && 'Matches if text appears anywhere'}
                {matchType === 'startsWith' && 'Matches if description starts with pattern'}
                {matchType === 'endsWith' && 'Matches if description ends with pattern'}
              </p>
            </div>

            {/* Regex toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="regex"
                checked={isRegex}
                onCheckedChange={(checked) => setIsRegex(checked as boolean)}
              />
              <Label htmlFor="regex" className="text-sm font-normal cursor-pointer">
                Use Regular Expression (advanced)
              </Label>
            </div>

            {/* Case sensitive */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="caseSensitive"
                checked={caseSensitive}
                onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
              />
              <Label htmlFor="caseSensitive" className="text-sm font-normal cursor-pointer">
                Case Sensitive
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {/* Priority */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Priority</Label>
                <span className="text-sm font-medium">{priority}</span>
              </div>
              <Slider
                value={[priority]}
                onValueChange={(value) => setPriority(value[0])}
                min={0}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher priority rules are checked first (0-100)
              </p>
            </div>

            {/* Amount Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Min Amount (optional)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Max Amount (optional)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="∞"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Exclude Patterns */}
            <div className="space-y-2">
              <Label>Exclude Patterns (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newExcludePattern}
                  onChange={(e) => setNewExcludePattern(e.target.value)}
                  placeholder="e.g., REFUND"
                  onKeyPress={(e) => e.key === 'Enter' && addExcludePattern()}
                />
                <Button type="button" size="sm" onClick={addExcludePattern}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {excludePatterns.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {excludePatterns.map((pattern, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {pattern}
                      <button
                        onClick={() => removeExcludePattern(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Transactions containing these patterns will be excluded
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <RulePreview rule={previewRule} transactions={transactions} maxResults={10} />
          </TabsContent>
        </Tabs>

        {!pattern && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-600 dark:text-amber-400">
              Pattern is required
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!pattern.trim()}>
            {existingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
