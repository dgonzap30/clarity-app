import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface MonthNavigationProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthNavigation({ selectedMonth, onMonthChange, className }: MonthNavigationProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedMonth.getFullYear());

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // Add swipe gesture support for mobile
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleNextMonth,
    onSwipeRight: handlePreviousMonth,
    threshold: 50,
  });

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(pickerYear, monthIndex, 1);
    onMonthChange(newDate);
    setPickerOpen(false);
  };

  const handleToday = () => {
    onMonthChange(new Date());
    setPickerOpen(false);
  };

  const isCurrentMonth = (monthIndex: number) => {
    const today = new Date();
    return pickerYear === today.getFullYear() && monthIndex === today.getMonth();
  };

  const isSelectedMonth = (monthIndex: number) => {
    return pickerYear === selectedMonth.getFullYear() && monthIndex === selectedMonth.getMonth();
  };

  return (
    <div className={cn("flex items-center", className)} {...swipeHandlers}>
      <div className="flex items-center gap-1 px-1.5 py-1 rounded-2xl backdrop-blur-sm bg-muted/80 dark:bg-muted/60 border border-white/20 dark:border-white/10 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
          className="h-9 w-9 min-h-[44px] min-w-[44px] hover:bg-accent rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 h-9 min-h-[44px] hover:bg-accent rounded-xl"
              aria-label="Open month picker"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                <span className="hidden sm:inline">{format(selectedMonth, 'MMMM yyyy')}</span>
                <span className="sm:hidden">{format(selectedMonth, 'MMM yy')}</span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="center">
            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPickerYear(y => y - 1)}
                className="h-8 w-8"
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">{pickerYear}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPickerYear(y => y + 1)}
                className="h-8 w-8"
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((month, index) => (
                <Button
                  key={month}
                  variant={isSelectedMonth(index) ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "h-9 text-xs",
                    isCurrentMonth(index) && !isSelectedMonth(index) && 'ring-1 ring-primary/50'
                  )}
                >
                  {month.slice(0, 3)}
                </Button>
              ))}
            </div>

            {/* Today Button */}
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="w-full gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Jump to Today
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Next month"
          className="h-9 w-9 min-h-[44px] min-w-[44px] hover:bg-accent rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
