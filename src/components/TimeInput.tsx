import { Minus, Plus } from "lucide-react";

interface TimeInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Time input component with increment/decrement buttons.
 *
 * Provides a user-friendly interface for time input using +1, +5 buttons
 * instead of direct number input. Includes validation for min/max values.
 *
 * @param value - Current time value in minutes
 * @param onChange - Callback when value changes
 * @param min - Minimum allowed value (default: 1)
 * @param max - Maximum allowed value (default: 240)
 * @param className - Additional CSS classes
 */
export function TimeInput({
  value,
  onChange,
  min = 1,
  max = 240,
  className = "",
}: TimeInputProps) {
  /**
   * Updates the time value with validation.
   * Ensures the new value stays within min/max bounds.
   *
   * @param newValue - The new time value to set
   */
  const updateValue = (newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    onChange(clampedValue);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center bg-muted rounded-md">
        {/* Decrement buttons */}
        <button
          type="button"
          onClick={() => updateValue(value - 5)}
          disabled={value <= min}
          className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md hover:bg-muted-foreground/10"
          title="-5 min"
        >
          <span className="text-xs font-medium">-5</span>
        </button>
        <button
          type="button"
          onClick={() => updateValue(value - 1)}
          disabled={value <= min}
          className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-muted-foreground/10"
          title="-1 min"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Current value display */}
        <div className="px-4 py-2 bg-background border-x border-border min-w-[60px] text-center">
          <span className="font-medium text-foreground">{value}</span>
        </div>

        {/* Increment buttons */}
        <button
          type="button"
          onClick={() => updateValue(value + 1)}
          disabled={value >= max}
          className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-muted-foreground/10"
          title="+1 min"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => updateValue(value + 5)}
          disabled={value >= max}
          className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-md hover:bg-muted-foreground/10"
          title="+5 min"
        >
          <span className="text-xs font-medium">+5</span>
        </button>
      </div>
      <span className="text-sm text-muted-foreground">min</span>
    </div>
  );
}
