import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Upload, Keyboard, User, Sparkles, Download, FileUp, Database, Trash2, RotateCcw, Bomb } from 'lucide-react';
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
import type { UseSettingsReturn } from '@/hooks/useSettings';
import type { UserSettings } from '@/types/settings';

interface PreferencesSettingsProps {
  settingsHook: UseSettingsReturn;
  transactionCount: number;
  onClearTransactions: () => void;
}

export function PreferencesSettings({ settingsHook, transactionCount, onClearTransactions }: PreferencesSettingsProps) {
  const { settings, setPreference, updateSettings, resetToDefaults } = settingsHook;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showClearTransactionsDialog, setShowClearTransactionsDialog] = useState(false);
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false);
  const [showClearEverythingDialog, setShowClearEverythingDialog] = useState(false);

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedSettings = JSON.parse(content) as UserSettings;

        // Basic validation
        if (!importedSettings.version || !importedSettings.budgets) {
          throw new Error('Invalid settings file format');
        }

        // Update settings
        updateSettings(importedSettings);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import settings');
      }
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearTransactions = () => {
    onClearTransactions();
    setShowClearTransactionsDialog(false);
  };

  const handleResetSettings = () => {
    resetToDefaults();
    setShowResetSettingsDialog(false);
  };

  const handleClearEverything = () => {
    onClearTransactions();
    resetToDefaults();
    setShowClearEverythingDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile & Personalization */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Profile & Personalization</CardTitle>
          </div>
          <CardDescription>
            Customize your dashboard experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="font-medium">
              Your Name
            </Label>
            <Input
              id="userName"
              value={settings.preferences.userName || ''}
              onChange={(e) => setPreference('userName', e.target.value)}
              placeholder="Enter your name"
              className="w-full sm:max-w-sm"
            />
            <p className="text-xs text-muted-foreground">
              Used for personalized greetings in the header
            </p>
          </div>

          {/* Greeting Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <User className="h-4 w-4 text-success" />
              </div>
              <div>
                <Label htmlFor="enable-greetings" className="font-medium">
                  Personalized Greetings
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show time-based greetings with your name
                </p>
              </div>
            </div>
            <Switch
              id="enable-greetings"
              checked={settings.preferences.enableGreetings !== false}
              onCheckedChange={(checked) =>
                setPreference('enableGreetings', checked)
              }
            />
          </div>

          {/* Fun Messages Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="enable-fun-messages" className="font-medium">
                  Fun Status Messages
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show playful budget status messages
                </p>
              </div>
            </div>
            <Switch
              id="enable-fun-messages"
              checked={settings.preferences.enableFunMessages !== false}
              onCheckedChange={(checked) =>
                setPreference('enableFunMessages', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* General Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Configure how the dashboard behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confirm Destructive Actions */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <Label htmlFor="confirm-destructive" className="font-medium">
                  Confirm destructive actions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show confirmation dialog before deleting transactions
                </p>
              </div>
            </div>
            <Switch
              id="confirm-destructive"
              checked={settings.preferences.confirmDestructiveActions}
              onCheckedChange={(checked) =>
                setPreference('confirmDestructiveActions', checked)
              }
            />
          </div>

          {/* Default Upload Mode */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="upload-mode" className="font-medium">
                  Default upload mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  How to handle new CSV uploads
                </p>
              </div>
            </div>
            <Select
              value={settings.preferences.defaultUploadMode}
              onValueChange={(value: 'merge' | 'replace') =>
                setPreference('defaultUploadMode', value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">Merge</SelectItem>
                <SelectItem value="replace">Replace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
          </div>
          <CardDescription>
            Quick actions using keyboard shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Open upload modal</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                ⌘ U
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Export data</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                ⌘ E
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Open settings</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                ⌘ ,
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Focus search</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                ⌘ F
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b md:border-b-0">
              <span className="text-muted-foreground">Previous month</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                ←
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b md:border-b-0">
              <span className="text-muted-foreground">Next month</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                →
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 md:col-span-2">
              <span className="text-muted-foreground">Show shortcuts help</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                ?
              </kbd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Data Management</CardTitle>
          </div>
          <CardDescription>
            Export or import your settings for backup or transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Settings */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Export Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your settings as a JSON file
                </p>
              </div>
            </div>
            <Button onClick={handleExportSettings} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Import Settings */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FileUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <Label className="font-medium">Import Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Restore settings from a JSON file
                </p>
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportSettings}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* Import Success Message */}
          {importSuccess && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-success">
                Settings imported successfully!
              </p>
            </div>
          )}

          {/* Import Error Message */}
          {importError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                {importError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            These actions are irreversible. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Clear All Transactions */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <Label className="font-medium">Clear All Transactions</Label>
                <p className="text-sm text-muted-foreground">
                  Remove all {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} from the dashboard
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowClearTransactionsDialog(true)}
              variant="destructive"
              size="sm"
              disabled={transactionCount === 0}
            >
              Clear Data
            </Button>
          </div>

          {/* Reset Settings */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <RotateCcw className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <Label className="font-medium">Reset Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Restore categories, budgets, and rules to defaults
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowResetSettingsDialog(true)}
              variant="destructive"
              size="sm"
            >
              Reset
            </Button>
          </div>

          {/* Clear Everything */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Bomb className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <Label className="font-medium">Clear Everything</Label>
                <p className="text-sm text-muted-foreground">
                  Delete all data and start fresh
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowClearEverythingDialog(true)}
              variant="destructive"
              size="sm"
            >
              Clear Everything
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showClearTransactionsDialog} onOpenChange={setShowClearTransactionsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} from your dashboard.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearTransactions} className="bg-destructive hover:bg-destructive/90">
              Clear Transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset settings to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all settings including custom categories, budgets, rules, and preferences to their default values.
              Your transactions will not be affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings} className="bg-destructive hover:bg-destructive/90">
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearEverythingDialog} onOpenChange={setShowClearEverythingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear everything?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} and reset all settings to defaults.
              You will lose all your data, custom categories, budgets, and rules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearEverything} className="bg-destructive hover:bg-destructive/90">
              Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
