import { Clock } from "lucide-react";

interface MeetingTimerProps {
  totalElapsed: number;
  totalEstimated: number;
  isRunning: boolean;
  startTime?: number;
}

/**
 * Meeting countdown timer component.
 *
 * Displays remaining time by subtracting elapsed time from estimated total.
 * Shows timer in countdown format with visual indicators for running state.
 * Changes appearance when time is exceeded.
 * Also displays start time and estimated end time for reference.
 *
 * @param totalElapsed - Total elapsed time in milliseconds
 * @param totalEstimated - Total estimated time in minutes
 * @param isRunning - Whether the timer is currently running
 * @param startTime - Meeting start timestamp in milliseconds (optional)
 */
export function MeetingTimer({
  totalElapsed,
  totalEstimated,
  isRunning,
  startTime,
}: MeetingTimerProps) {
  const totalEstimatedMs = totalEstimated * 60000; // Convert minutes to milliseconds
  const remainingMs = Math.max(0, totalEstimatedMs - totalElapsed);
  const isOvertime = totalElapsed > totalEstimatedMs;

  // Calculate progress percentage (capped at 100% for overtime)
  const progressPercentage = Math.min(100, (totalElapsed / totalEstimatedMs) * 100);

  // For overtime, show elapsed time beyond estimate
  const displayMs = isOvertime ? totalElapsed - totalEstimatedMs : remainingMs;

  const hours = Math.floor(displayMs / 3600000);
  const minutes = Math.floor((displayMs % 3600000) / 60000);
  const seconds = Math.floor((displayMs % 60000) / 1000);

  // Format time display helper
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate start and end times
  const meetingStartTime = startTime || Date.now() - totalElapsed;
  const estimatedEndTime = meetingStartTime + totalEstimatedMs;

  return (
    <div className="relative">
      {/* Background glow effect when running */}
      {isRunning && (
        <div
          className={`absolute inset-0 rounded-2xl blur-2xl animate-pulse ${
            isOvertime ? "bg-destructive/20" : "bg-primary/20"
          }`}
        />
      )}

      <div
        className={`relative bg-card border rounded-2xl p-8 text-center ${
          isOvertime ? "border-destructive/50" : "border-border"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock
            className={`w-8 h-8 ${
              isOvertime ? "text-destructive" : "text-muted-foreground"
            }`}
          />
          {isOvertime && (
            <span className="text-sm font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
              OVERTIME
            </span>
          )}
        </div>

        {/* Large timer display */}
        <div className="flex items-center justify-center gap-2 text-6xl font-mono font-bold">
          {isOvertime && <span className="text-destructive">+</span>}
          <span
            className={`tabular-nums ${
              isOvertime ? "text-destructive" : "text-primary"
            }`}
          >
            {hours.toString().padStart(2, "0")}
          </span>
          <span className="text-muted-foreground animate-pulse">:</span>
          <span
            className={`tabular-nums ${
              isOvertime ? "text-destructive" : "text-primary"
            }`}
          >
            {minutes.toString().padStart(2, "0")}
          </span>
          <span className="text-muted-foreground animate-pulse">:</span>
          <span
            className={`tabular-nums ${
              isOvertime ? "text-destructive" : "text-primary"
            }`}
          >
            {seconds.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-6 mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isOvertime ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Meeting times */}
        <div className="mt-4 flex justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="text-left">
            <div className="font-medium">Start</div>
            <div>{formatTime(meetingStartTime)}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Est. End</div>
            <div className={isOvertime ? "text-destructive" : ""}>
              {formatTime(estimatedEndTime)}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-2 text-sm text-muted-foreground">
          {isOvertime ? "Time Over" : "Time Remaining"}
        </div>

        {/* Visual running indicator */}
        {isRunning && (
          <div className="mt-4 flex items-center justify-center gap-1">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isOvertime ? "bg-destructive" : "bg-green-500"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full animate-pulse delay-150 ${
                isOvertime ? "bg-destructive" : "bg-green-500"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full animate-pulse delay-300 ${
                isOvertime ? "bg-destructive" : "bg-green-500"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
