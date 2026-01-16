import { useState } from 'react';
import {
  MoreHorizontal,
  FileText,
  FileJson,
  FileSpreadsheet,
  Settings,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface ActionsMenuProps {
  onExportPDF: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onSettingsClick: () => void;
}

export function ActionsMenu({
  onExportPDF,
  onExportJSON,
  onExportCSV,
  onSettingsClick,
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [exportExpanded, setExportExpanded] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
    setExportExpanded(false);
  };

  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    active,
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors",
        "hover:bg-accent",
        active && "bg-accent text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{label}</span>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setExportExpanded(false);
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-lg hover:bg-accent"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end" sideOffset={8}>
        {/* Export Section */}
        <div className="mb-1">
          <button
            onClick={() => setExportExpanded(!exportExpanded)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-colors",
              "hover:bg-accent",
              exportExpanded && "bg-accent/50"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Export</span>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                exportExpanded && "rotate-90"
              )}
            />
          </button>

          {exportExpanded && (
            <div className="ml-4 pl-3 border-l border-border/50 mt-1 space-y-0.5">
              <MenuItem
                icon={FileText}
                label="Export as PDF"
                onClick={() => handleAction(onExportPDF)}
              />
              <MenuItem
                icon={FileJson}
                label="Export as JSON"
                onClick={() => handleAction(onExportJSON)}
              />
              <MenuItem
                icon={FileSpreadsheet}
                label="Export as CSV"
                onClick={() => handleAction(onExportCSV)}
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-2" />

        {/* Settings */}
        <MenuItem
          icon={Settings}
          label="Settings"
          onClick={() => handleAction(onSettingsClick)}
        />

        {/* Divider */}
        <div className="h-px bg-border my-2" />

        {/* Theme Section */}
        <div className="px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Appearance
          </span>
        </div>
        <div className="space-y-0.5">
          <MenuItem
            icon={Sun}
            label="Light"
            onClick={() => setTheme('light')}
            active={theme === 'light'}
          />
          <MenuItem
            icon={Moon}
            label="Dark"
            onClick={() => setTheme('dark')}
            active={theme === 'dark'}
          />
          <MenuItem
            icon={Monitor}
            label="System"
            onClick={() => setTheme('system')}
            active={theme === 'system'}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
