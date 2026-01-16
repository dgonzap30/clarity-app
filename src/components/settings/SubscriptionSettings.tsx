/**
 * SubscriptionSettings - Configure subscription detection and notification preferences
 */

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Plus, X } from 'lucide-react';
import type { UseSettingsReturn } from '@/hooks/useSettings';

interface SubscriptionSettingsProps {
  settingsHook: UseSettingsReturn;
}

export function SubscriptionSettings({ settingsHook }: SubscriptionSettingsProps) {
  const { settings, updateSubscriptionSettings } = settingsHook;
  const subscriptionSettings = settings.subscriptions;

  const [newPattern, setNewPattern] = useState('');

  const handleToggleAutoDetection = (enabled: boolean) => {
    updateSubscriptionSettings({
      enableAutoDetection: enabled,
    });
  };

  const handleMinOccurrencesChange = (value: number[]) => {
    updateSubscriptionSettings({
      minimumOccurrences: value[0],
    });
  };

  const handleConfidenceThresholdChange = (value: number[]) => {
    updateSubscriptionSettings({
      confidenceThreshold: value[0] / 100,
    });
  };

  const handleToggleRenewalNotifications = (enabled: boolean) => {
    updateSubscriptionSettings({
      enableRenewalNotifications: enabled,
    });
  };

  const handleDefaultNotifyDaysChange = (value: string) => {
    updateSubscriptionSettings({
      defaultNotifyDaysBefore: parseInt(value, 10),
    });
  };

  const handleAddPattern = () => {
    if (newPattern.trim() && !subscriptionSettings.ignoredPatterns.includes(newPattern.trim())) {
      updateSubscriptionSettings({
        ignoredPatterns: [...subscriptionSettings.ignoredPatterns, newPattern.trim()],
      });
      setNewPattern('');
    }
  };

  const handleRemovePattern = (pattern: string) => {
    updateSubscriptionSettings({
      ignoredPatterns: subscriptionSettings.ignoredPatterns.filter((p) => p !== pattern),
    });
  };

  return (
    <div className="space-y-6">
      {/* Detection Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>Detection Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how recurring subscriptions are automatically detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Auto-Detection Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-detection">Enable Auto-Detection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically identify recurring payments
              </p>
            </div>
            <Switch
              id="auto-detection"
              checked={subscriptionSettings.enableAutoDetection}
              onCheckedChange={handleToggleAutoDetection}
            />
          </div>

          {/* Minimum Occurrences Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum Occurrences</Label>
              <span className="text-sm font-medium">{subscriptionSettings.minimumOccurrences}</span>
            </div>
            <Slider
              value={[subscriptionSettings.minimumOccurrences]}
              onValueChange={handleMinOccurrencesChange}
              min={2}
              max={5}
              step={1}
              disabled={!subscriptionSettings.enableAutoDetection}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum number of charges needed to detect a pattern
            </p>
          </div>

          {/* Confidence Threshold Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Confidence Threshold</Label>
              <span className="text-sm font-medium">
                {Math.round(subscriptionSettings.confidenceThreshold * 100)}%
              </span>
            </div>
            <Slider
              value={[subscriptionSettings.confidenceThreshold * 100]}
              onValueChange={handleConfidenceThresholdChange}
              min={50}
              max={90}
              step={5}
              disabled={!subscriptionSettings.enableAutoDetection}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum confidence level to show subscription suggestions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>
            Control when you receive renewal reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Renewal Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="renewal-notifications">Enable Renewal Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified before subscriptions renew
              </p>
            </div>
            <Switch
              id="renewal-notifications"
              checked={subscriptionSettings.enableRenewalNotifications}
              onCheckedChange={handleToggleRenewalNotifications}
            />
          </div>

          {/* Default Days Before Select */}
          <div className="space-y-2">
            <Label htmlFor="notify-days">Default Days Before Renewal</Label>
            <Select
              value={subscriptionSettings.defaultNotifyDaysBefore.toString()}
              onValueChange={handleDefaultNotifyDaysChange}
              disabled={!subscriptionSettings.enableRenewalNotifications}
            >
              <SelectTrigger id="notify-days">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 7, 10, 14].map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? 'day' : 'days'} before
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How many days in advance to send renewal reminders
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ignored Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Ignored Patterns</CardTitle>
          <CardDescription>
            Merchant patterns to exclude from subscription detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Pattern Input */}
          <div className="flex gap-2">
            <Input
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="e.g., ONE-TIME, REFUND"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPattern()}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddPattern}
              disabled={!newPattern.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Ignored Patterns List */}
          {subscriptionSettings.ignoredPatterns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subscriptionSettings.ignoredPatterns.map((pattern) => (
                <Badge key={pattern} variant="outline" className="gap-1 pr-1">
                  {pattern}
                  <button
                    onClick={() => handleRemovePattern(pattern)}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label={`Remove ${pattern}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
              No ignored patterns. Add patterns to exclude from subscription detection.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
