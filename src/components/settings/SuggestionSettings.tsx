/**
 * SuggestionSettings - Configure category suggestion preferences
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lightbulb } from 'lucide-react';
import type { UseSettingsReturn } from '@/hooks/useSettings';

interface SuggestionSettingsProps {
  settingsHook: UseSettingsReturn;
}

export function SuggestionSettings({ settingsHook }: SuggestionSettingsProps) {
  const { settings, updateSuggestionSettings } = settingsHook;
  const suggestionSettings = settings.suggestionSettings;

  const handleToggleSuggestions = (enabled: boolean) => {
    updateSuggestionSettings({
      enableSuggestions: enabled,
    });
  };

  const handleMinConfidenceChange = (value: number[]) => {
    updateSuggestionSettings({
      minConfidence: value[0] / 100,
    });
  };

  const handleMaxSuggestionsChange = (value: string) => {
    updateSuggestionSettings({
      maxSuggestions: parseInt(value, 10),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Category Suggestions</CardTitle>
          </div>
          <CardDescription>
            Configure automatic category suggestions based on learned patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Suggestions Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-suggestions">Enable Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Show category suggestions for uncategorized transactions
              </p>
            </div>
            <Switch
              id="enable-suggestions"
              checked={suggestionSettings.enableSuggestions}
              onCheckedChange={handleToggleSuggestions}
            />
          </div>

          {/* Minimum Confidence Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum Confidence</Label>
              <span className="text-sm font-medium">
                {Math.round(suggestionSettings.minConfidence * 100)}%
              </span>
            </div>
            <Slider
              value={[suggestionSettings.minConfidence * 100]}
              onValueChange={handleMinConfidenceChange}
              min={50}
              max={95}
              step={5}
              disabled={!suggestionSettings.enableSuggestions}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Only show suggestions with confidence above this threshold
            </p>
          </div>

          {/* Max Suggestions Select */}
          <div className="space-y-2">
            <Label htmlFor="max-suggestions">Maximum Suggestions</Label>
            <Select
              value={suggestionSettings.maxSuggestions.toString()}
              onValueChange={handleMaxSuggestionsChange}
              disabled={!suggestionSettings.enableSuggestions}
            >
              <SelectTrigger id="max-suggestions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'suggestion' : 'suggestions'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Maximum number of category suggestions to display per transaction
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-[hsl(var(--accent-green))] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">How Suggestions Work</p>
              <p className="text-sm text-muted-foreground">
                The system learns from your categorization patterns and suggests categories for
                similar transactions. Higher confidence means the suggestion is more certain based
                on your past behavior.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
