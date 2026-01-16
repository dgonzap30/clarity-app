import { Progress } from '@/components/ui/progress';

interface ConfidenceBarProps {
  confidence: number; // 0-1
  showLabel?: boolean;
}

export function ConfidenceBar({ confidence, showLabel = true }: ConfidenceBarProps) {
  const percent = Math.round(confidence * 100);

  // Determine status based on confidence level
  const status: 'success' | 'warning' | 'danger' =
    percent >= 80 ? 'success' : percent >= 50 ? 'warning' : 'danger';

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Detection Confidence</span>
          <span className="font-medium">{percent}%</span>
        </div>
      )}
      <Progress value={percent} status={status} className="h-1.5" />
    </div>
  );
}
