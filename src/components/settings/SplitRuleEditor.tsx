/**
 * SplitRuleEditor - Visual editor for split categorization rules
 * Allows same merchant to be categorized differently based on context
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Plus, Trash2, Split } from 'lucide-react';
import type { Category } from '@/types';
import type { SplitCategorizationRule, SplitRuleCondition } from '@/types/settings';

interface SplitRuleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rule: Omit<SplitCategorizationRule, 'id' | 'createdAt' | 'matchCount'>) => void;
  categories: Category[];
  existingRule?: SplitCategorizationRule;
}

interface ConditionRule {
  condition: SplitRuleCondition;
  categoryId: string;
  label?: string;
}

export function SplitRuleEditor({
  open,
  onOpenChange,
  onSave,
  categories,
  existingRule,
}: SplitRuleEditorProps) {
  const [merchantPattern, setMerchantPattern] = useState(existingRule?.merchantPattern || '');
  const [isRegex, setIsRegex] = useState(existingRule?.isRegex || false);
  const [defaultCategoryId, setDefaultCategoryId] = useState(
    existingRule?.defaultCategoryId || 'uncategorized'
  );
  const [conditions, setConditions] = useState<ConditionRule[]>(
    existingRule?.conditions || []
  );

  const handleSave = () => {
    if (!merchantPattern.trim() || conditions.length === 0) {
      return;
    }

    const rule: Omit<SplitCategorizationRule, 'id' | 'createdAt' | 'matchCount'> = {
      merchantPattern: merchantPattern.trim(),
      isRegex,
      defaultCategoryId,
      conditions,
    };

    onSave(rule);
    handleClose();
  };

  const handleClose = () => {
    setMerchantPattern('');
    setIsRegex(false);
    setDefaultCategoryId('uncategorized');
    setConditions([]);
    onOpenChange(false);
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        condition: {
          type: 'amount',
          operator: 'gt',
          value: 0,
        },
        categoryId: 'uncategorized',
        label: '',
      },
    ]);
  };

  const updateCondition = (index: number, updates: Partial<ConditionRule>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const isValid = merchantPattern.trim() && conditions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Split className="h-5 w-5 text-[hsl(var(--accent-green))]" />
            <DialogTitle>
              {existingRule ? 'Edit Split Rule' : 'Create Split Rule'}
            </DialogTitle>
          </div>
          <DialogDescription>
            Split rules allow you to categorize the same merchant differently based on context like amount, time, or description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Merchant Pattern */}
          <div className="space-y-2">
            <Label htmlFor="merchantPattern">Merchant Pattern</Label>
            <Input
              id="merchantPattern"
              value={merchantPattern}
              onChange={(e) => setMerchantPattern(e.target.value)}
              placeholder="e.g., AMAZON, TARGET"
            />
            <p className="text-xs text-muted-foreground">
              Pattern to match the merchant name
            </p>
          </div>

          {/* Regex toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="splitRegex"
              checked={isRegex}
              onCheckedChange={(checked) => setIsRegex(checked as boolean)}
            />
            <Label htmlFor="splitRegex" className="text-sm font-normal cursor-pointer">
              Use Regular Expression
            </Label>
          </div>

          {/* Default Category */}
          <div className="space-y-2">
            <Label htmlFor="defaultCategory">Default Category</Label>
            <Select value={defaultCategoryId} onValueChange={setDefaultCategoryId}>
              <SelectTrigger id="defaultCategory">
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
            <p className="text-xs text-muted-foreground">
              Used when no conditions match
            </p>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions</Label>
              <Button type="button" size="sm" variant="outline" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>

            {conditions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                No conditions yet. Add at least one condition to create a split rule.
              </div>
            )}

            {conditions.map((conditionRule, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Condition {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Condition Type */}
                  <div className="space-y-2">
                    <Label>Condition Type</Label>
                    <Select
                      value={conditionRule.condition.type}
                      onValueChange={(type) =>
                        updateCondition(index, {
                          condition: {
                            ...conditionRule.condition,
                            type: type as typeof conditionRule.condition.type,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="time">Time of Day</SelectItem>
                        <SelectItem value="dayOfWeek">Day of Week</SelectItem>
                        <SelectItem value="description">Description Contains</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator */}
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select
                      value={conditionRule.condition.operator}
                      onValueChange={(operator) =>
                        updateCondition(index, {
                          condition: {
                            ...conditionRule.condition,
                            operator: operator as typeof conditionRule.condition.operator,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionRule.condition.type === 'description' ? (
                          <>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="eq">Equals</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="gt">Greater Than</SelectItem>
                            <SelectItem value="lt">Less Than</SelectItem>
                            <SelectItem value="eq">Equals</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value(s) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>
                        {conditionRule.condition.type === 'amount' && 'Amount'}
                        {conditionRule.condition.type === 'time' && 'Hour (0-23)'}
                        {conditionRule.condition.type === 'dayOfWeek' && 'Day (0=Sun, 6=Sat)'}
                        {conditionRule.condition.type === 'description' && 'Text'}
                      </Label>
                      {conditionRule.condition.type === 'description' ? (
                        <Input
                          type="text"
                          value={String(conditionRule.condition.value)}
                          onChange={(e) =>
                            updateCondition(index, {
                              condition: {
                                ...conditionRule.condition,
                                value: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        <Input
                          type="number"
                          value={Number(conditionRule.condition.value)}
                          onChange={(e) =>
                            updateCondition(index, {
                              condition: {
                                ...conditionRule.condition,
                                value: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      )}
                    </div>

                    {conditionRule.condition.operator === 'between' && (
                      <div className="space-y-2">
                        <Label>End Value</Label>
                        <Input
                          type="number"
                          value={conditionRule.condition.valueEnd || 0}
                          onChange={(e) =>
                            updateCondition(index, {
                              condition: {
                                ...conditionRule.condition,
                                valueEnd: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={conditionRule.categoryId}
                      onValueChange={(categoryId) =>
                        updateCondition(index, { categoryId })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
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
                  </div>

                  {/* Label (optional) */}
                  <div className="space-y-2">
                    <Label>Label (optional)</Label>
                    <Input
                      value={conditionRule.label || ''}
                      onChange={(e) =>
                        updateCondition(index, { label: e.target.value })
                      }
                      placeholder="e.g., Work, Personal"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {!isValid && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-600 dark:text-amber-400">
              Merchant pattern and at least one condition are required
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {existingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
