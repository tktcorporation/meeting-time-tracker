import { useEffect, useState } from "react";

/**
 * Custom hook for managing timer state and current time updates.
 *
 * This hook provides core timer functionality including:
 * - Managing the isRunning state of the timer
 * - Providing current timestamp that updates every second when timer is running
 * - Automatic cleanup of intervals when component unmounts or timer stops
 *
 * The hook automatically starts a setInterval when isRunning becomes true
 * and cleans up the interval when isRunning becomes false or the component unmounts.
 *
 * @param initialIsRunning - Initial running state of the timer (defaults to false)
 * @returns Object containing timer state and controls
 * @returns returns.isRunning - Current running state of the timer
 * @returns returns.currentTime - Current timestamp (Date.now()) that updates every second when running
 * @returns returns.setIsRunning - Function to update the running state
 * @returns returns.pause - Convenience function to pause the timer (sets isRunning to false)
 * @returns returns.resume - Convenience function to resume the timer (sets isRunning to true)
 *
 * @example
 * ```tsx
 * const { isRunning, currentTime, setIsRunning, pause, resume } = useTimerState();
 *
 * // Start the timer
 * resume();
 *
 * // Pause the timer
 * pause();
 *
 * // Check if timer is running
 * if (isRunning) {
 *   console.log("Timer is active, current time:", currentTime);
 * }
 * ```
 */
export function useTimerState(initialIsRunning = false) {
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [currentTime, setCurrentTime] = useState(Date.now());

  /**
   * Effect that manages the timer interval.
   * Creates a 1-second interval when isRunning is true to update currentTime.
   * Automatically cleans up the interval when isRunning becomes false or component unmounts.
   */
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  /**
   * Convenience function to pause the timer.
   * Sets isRunning to false, which will stop the interval.
   */
  const pause = () => {
    setIsRunning(false);
  };

  /**
   * Convenience function to resume the timer.
   * Sets isRunning to true, which will start the interval.
   */
  const resume = () => {
    setIsRunning(true);
  };

  return {
    isRunning,
    currentTime,
    setIsRunning,
    pause,
    resume,
  };
}
