import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RuleBuilder } from './RuleBuilder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ListFilter,
  Brain,
  Search,
} from 'lucide-react';
import type { UseSettingsReturn } from '@/hooks/useSettings';
import type { CategoryId } from '@/types';
import type { CustomCategorizationRule } from '@/types/settings';
import { useCategories } from '@/hooks/useCategories';

interface RulesSettingsProps {
  settingsHook: UseSettingsReturn;
}

export function RulesSettings({ settingsHook }: RulesSettingsProps) {
  const { settings, addRule, updateRule, deleteRule, forgetPattern, trustPattern, setPreference } =
    settingsHook;
  const { categories, categoryList } = useCategories(settings);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    pattern: '',
    categoryId: 'personal' as CategoryId,
    isRegex: false,
    priority: 100,
  });

  // New state for RuleBuilder
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const handleEditRule = (rule: CustomCategorizationRule) => {
    setEditingRuleId(rule.id);
    setNewRule({
      pattern: rule.pattern,
      categoryId: rule.categoryId,
      isRegex: rule.isRegex,
      priority: rule.priority,
    });
  };

  const handleSaveEdit = (ruleId: string) => {
    updateRule(ruleId, {
      pattern: newRule.pattern.trim(),
      categoryId: newRule.categoryId,
      isRegex: newRule.isRegex,
      priority: newRule.priority,
    });
    setEditingRuleId(null);
    setNewRule({ pattern: '', categoryId: 'personal', isRegex: false, priority: 100 });
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setNewRule({ pattern: '', categoryId: 'personal', isRegex: false, priority: 100 });
  };

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      deleteRule(ruleToDelete);
      setRuleToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setRuleToDelete(null);
    setDeleteConfirmOpen(false);
  };

  // Filter rules based on search query
  const filteredRules = settings.customRules.filter((rule) =>
    rule.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (categories[rule.categoryId]?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Custom Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Custom Rules</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRuleBuilderOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          </div>
          <CardDescription>
            Create rules to automatically categorize transactions based on patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Rules List */}
          {filteredRules.length === 0 && settings.customRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListFilter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No custom rules yet</p>
              <p className="text-sm">Add a rule to automatically categorize transactions</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No rules found matching "{searchQuery}"
            </div>
          ) : (
            filteredRules.map((rule) => {
              const category = categories[rule.categoryId] || categories['uncategorized'];
              const isEditing = editingRuleId === rule.id;

              if (isEditing) {
                return (
                  <div
                    key={rule.id}
                    className="p-3 rounded-lg border bg-accent/50 space-y-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        value={newRule.pattern}
                        onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                        placeholder="Pattern"
                      />
                      <Select
                        value={newRule.categoryId}
                        onValueChange={(value) =>
                          setNewRule({ ...newRule, categoryId: value as CategoryId })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryList.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(rule.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={rule.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {rule.pattern}
                      </code>
                      {rule.isRegex && (
                        <Badge variant="outline" className="text-xs">
                          regex
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Matched {rule.matchCount} time{rule.matchCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleEditRule(rule)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Learned Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Learned Patterns</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-learning" className="text-sm text-muted-foreground">
                Auto-learn
              </Label>
              <Switch
                id="enable-learning"
                checked={settings.preferences.enablePatternLearning}
                onCheckedChange={(checked) => setPreference('enablePatternLearning', checked)}
              />
            </div>
          </div>
          <CardDescription>
            Patterns learned automatically when you recategorize transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.learnedPatterns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No patterns learned yet</p>
              <p className="text-sm">
                Patterns are learned when you recategorize transactions
              </p>
            </div>
          ) : (
            settings.learnedPatterns
              .sort((a, b) => b.confidence - a.confidence)
              .map((pattern) => {
                const category = categories[pattern.categoryId] || categories['uncategorized'];
                const confidencePercent = Math.round(pattern.confidence * 100);

                return (
                  <div
                    key={pattern.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded truncate">
                          {pattern.merchantPattern}
                        </code>
                        <span className="text-muted-foreground">→</span>
                        <Badge
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span
                          className={
                            confidencePercent >= 80
                              ? 'text-green-500'
                              : confidencePercent >= 60
                              ? 'text-yellow-500'
                              : 'text-muted-foreground'
                          }
                        >
                          {confidencePercent}% confidence
                        </span>
                        <span>·</span>
                        <span>{pattern.occurrences} occurrences</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => trustPattern(pattern.id)}
                        disabled={pattern.confidence >= 1}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Trust
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => forgetPattern(pattern.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>

      {/* RuleBuilder Dialog */}
      <RuleBuilder
        open={ruleBuilderOpen}
        onOpenChange={setRuleBuilderOpen}
        onSave={(rule) => {
          addRule(rule);
          setRuleBuilderOpen(false);
        }}
        categories={categoryList}
        transactions={[]}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this categorization rule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
