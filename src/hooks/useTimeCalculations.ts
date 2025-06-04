import { useCallback, useEffect } from "react";
import type { AgendaItem } from "./useMeetingState";

/**
 * Custom hook for managing time calculations and background time tracking.
 *
 * This hook provides time calculation utilities and handles background time tracking
 * when the browser tab becomes hidden or visible. It ensures accurate time tracking
 * even when the user switches tabs or the browser is minimized.
 *
 * Key responsibilities:
 * - Calculate current elapsed time for agenda items
 * - Calculate total elapsed and estimated times
 * - Handle visibility changes to maintain accurate time tracking in background
 * - Update agenda items when tab visibility changes to preserve time continuity
 *
 * The visibility change handling ensures that active agenda items continue to
 * accumulate elapsed time even when the browser tab is not visible.
 *
 * @param agendaItems - Array of agenda items for time calculations
 * @param currentTime - Current timestamp from timer (updates every second)
 * @param isRunning - Whether the timer is currently running
 * @param setAgendaItems - Function to update agenda items state
 * @returns Object containing time calculation functions and computed values
 * @returns returns.getCurrentElapsed - Function to get current elapsed time for an item
 * @returns returns.totalElapsed - Total elapsed time across all agenda items in milliseconds
 * @returns returns.totalEstimated - Total estimated time across all agenda items in milliseconds
 *
 * @example
 * ```tsx
 * const { getCurrentElapsed, totalElapsed, totalEstimated } = useTimeCalculations(
 *   agendaItems,
 *   currentTime,
 *   isRunning,
 *   setAgendaItems
 * );
 *
 * // Get current elapsed time for a specific item
 * const elapsed = getCurrentElapsed(agendaItems[0]);
 *
 * // Display total times
 * console.log(`Total elapsed: ${totalElapsed}ms`);
 * console.log(`Total estimated: ${totalEstimated}ms`);
 * ```
 */
export function useTimeCalculations(
  agendaItems: AgendaItem[],
  currentTime: number,
  isRunning: boolean,
  setAgendaItems: React.Dispatch<React.SetStateAction<AgendaItem[]>>,
) {
  /**
   * Calculates the current elapsed time for a specific agenda item.
   *
   * For active items with a start time, returns the sum of:
   * - Previously accumulated elapsed time
   * - Time elapsed since the current start time
   *
   * For inactive items, returns only the accumulated elapsed time.
   *
   * @param item - The agenda item to calculate elapsed time for
   * @returns Elapsed time in milliseconds
   */
  const getCurrentElapsed = useCallback(
    (item: AgendaItem): number => {
      if (item.isActive && item.startTime) {
        return item.elapsedTime + (currentTime - item.startTime);
      }
      return item.elapsedTime;
    },
    [currentTime],
  );

  /**
   * Calculates the total elapsed time across all agenda items.
   * Uses actualMinutes for completed items and getCurrentElapsed for others.
   */
  const totalElapsed = agendaItems.reduce((sum, item) => {
    if (item.actualMinutes) return sum + item.actualMinutes * 60000;
    return sum + getCurrentElapsed(item);
  }, 0);

  /**
   * Calculates the total estimated time across all agenda items.
   */
  const totalEstimated = agendaItems.reduce(
    (sum, item) => sum + item.estimatedMinutes * 60000,
    0,
  );

  /**
   * Handles tab visibility changes to maintain accurate time tracking.
   *
   * When tab becomes hidden:
   * - Saves current elapsed time for active items
   * - Updates startTime to current timestamp for restoration
   *
   * When tab becomes visible:
   * - Restores active items with fresh startTime for continued tracking
   *
   * This ensures time continues to accumulate even when the browser tab
   * is not visible or the browser is minimized.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Tab is being hidden, save current state with timestamps
        setAgendaItems((items) =>
          items.map((item) => {
            if (item.isActive && item.startTime) {
              // Save elapsed time up to this point
              return {
                ...item,
                elapsedTime: item.elapsedTime + (Date.now() - item.startTime),
                startTime: Date.now(), // Will be recalculated on restore
              };
            }
            return item;
          }),
        );
      } else if (!document.hidden && isRunning) {
        // Tab is becoming visible, restore with fresh timestamp
        setAgendaItems((items) =>
          items.map((item) => {
            if (item.isActive) {
              return {
                ...item,
                startTime: Date.now(), // Fresh start time
              };
            }
            return item;
          }),
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, setAgendaItems]);

  return {
    getCurrentElapsed,
    totalElapsed,
    totalEstimated,
  };
}
