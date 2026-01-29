import { Link } from 'react-router-dom';
import { Upload, BarChart3, Settings } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ActionsMenu } from '@/components/ui/actions-menu';


interface HeaderProps {
  onUploadClick: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onAnalyticsClick?: () => void;
}

export function Header({
  onUploadClick,
  onExportPDF,
  onExportJSON,
  onExportCSV,
  onAnalyticsClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
          <Logo size="sm" className="sm:hidden text-primary" />
          <Logo size="md" className="hidden sm:block text-primary" />
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Clarity
          </h1>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onAnalyticsClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAnalyticsClick}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={onUploadClick}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>

          <Link to="/settings">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>

          <ActionsMenu
            onExportPDF={onExportPDF}
            onExportJSON={onExportJSON}
            onExportCSV={onExportCSV}
          />
        </div>
      </div>
    </header>
  );
}
