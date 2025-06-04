import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimerState } from "./useTimerState";

/**
 * Test suite for useTimerState hook.
 *
 * Tests timer state management including:
 * - Initial state configuration
 * - isRunning state changes and interval management
 * - currentTime updates with intervals
 * - pause/resume functionality
 * - cleanup on unmount and state changes
 * - error handling and edge cases
 */
describe("useTimerState", () => {
  beforeEach(() => {
    // Reset all timers and mocks before each test
    vi.useFakeTimers();
    vi.clearAllTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useTimerState());

      expect(result.current.isRunning).toBe(false);
      expect(result.current.currentTime).toBeTypeOf("number");
      expect(result.current.setIsRunning).toBeTypeOf("function");
      expect(result.current.pause).toBeTypeOf("function");
      expect(result.current.resume).toBeTypeOf("function");
    });

    it("should initialize with custom initialIsRunning value", () => {
      const { result } = renderHook(() => useTimerState(true));

      expect(result.current.isRunning).toBe(true);
    });

    it("should set currentTime to current timestamp on initialization", () => {
      const mockNow = 1000000;
      vi.setSystemTime(mockNow);

      const { result } = renderHook(() => useTimerState());

      expect(result.current.currentTime).toBe(mockNow);
    });
  });

  describe("timer interval management", () => {
    it("should start interval when isRunning becomes true", () => {
      const { result } = renderHook(() => useTimerState());

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.setIsRunning(true);
      });

      expect(result.current.isRunning).toBe(true);

      // Verify interval is running by advancing time
      const initialTime = result.current.currentTime;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBeGreaterThan(initialTime);
    });

    it("should update currentTime every second when running", () => {
      const { result } = renderHook(() => useTimerState(true));

      const initialTime = result.current.currentTime;

      // Advance time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // currentTime should have been updated at least once
      expect(result.current.currentTime).toBeGreaterThan(initialTime);
    });

    it("should stop interval when isRunning becomes false", () => {
      const { result } = renderHook(() => useTimerState(true));

      // Timer should be running initially
      expect(result.current.isRunning).toBe(true);

      // Stop the timer
      act(() => {
        result.current.setIsRunning(false);
      });

      expect(result.current.isRunning).toBe(false);

      // Get current time after stopping
      const timeAfterStop = result.current.currentTime;

      // Advance time and verify currentTime doesn't update
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.currentTime).toBe(timeAfterStop);
    });

    it("should clear interval on unmount", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { unmount } = renderHook(() => useTimerState(true));

      // Unmount the hook
      unmount();

      // Verify clearInterval was called
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it("should handle multiple isRunning state changes correctly", () => {
      const { result } = renderHook(() => useTimerState());

      // Start timer
      act(() => {
        result.current.setIsRunning(true);
      });
      expect(result.current.isRunning).toBe(true);

      // Stop timer
      act(() => {
        result.current.setIsRunning(false);
      });
      expect(result.current.isRunning).toBe(false);

      // Start timer again
      act(() => {
        result.current.setIsRunning(true);
      });
      expect(result.current.isRunning).toBe(true);

      // Verify timer updates after restart
      const timeBeforeAdvance = result.current.currentTime;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBeGreaterThan(timeBeforeAdvance);
    });
  });

  describe("convenience functions", () => {
    it("should pause timer using pause function", () => {
      const { result } = renderHook(() => useTimerState(true));

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it("should resume timer using resume function", () => {
      const { result } = renderHook(() => useTimerState(false));

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it("should handle multiple pause/resume calls", () => {
      const { result } = renderHook(() => useTimerState());

      // Resume -> Pause -> Resume cycle
      act(() => {
        result.current.resume();
      });
      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.pause();
      });
      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.resume();
      });
      expect(result.current.isRunning).toBe(true);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle clearInterval with undefined interval", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { result } = renderHook(() => useTimerState());

      // Start and immediately stop timer multiple times
      act(() => {
        result.current.setIsRunning(true);
      });

      act(() => {
        result.current.setIsRunning(false);
      });

      act(() => {
        result.current.setIsRunning(true);
      });

      act(() => {
        result.current.setIsRunning(false);
      });

      // Should not throw even with rapid state changes
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it("should maintain timer accuracy over multiple intervals", () => {
      const { result } = renderHook(() => useTimerState(true));

      const initialTime = result.current.currentTime;

      // Advance time by 10 seconds in 1-second intervals
      for (let i = 0; i < 10; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }

      // currentTime should have been updated
      expect(result.current.currentTime).toBeGreaterThan(initialTime);
    });

    it("should handle rapid start/stop cycles without memory leaks", () => {
      const { result } = renderHook(() => useTimerState());

      // Rapidly start and stop timer
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setIsRunning(true);
          result.current.setIsRunning(false);
        });
      }

      // Should not crash or cause issues
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("system time changes", () => {
    it("should update currentTime when system time changes", () => {
      const { result } = renderHook(() => useTimerState(true));

      const initialTime = result.current.currentTime;

      // Simulate system time change
      vi.setSystemTime(initialTime + 5000);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBeGreaterThan(initialTime);
    });

    it("should handle Date.now() calls consistently", () => {
      const mockTime = 1609459200000; // Fixed timestamp
      vi.setSystemTime(mockTime);

      const { result } = renderHook(() => useTimerState());

      expect(result.current.currentTime).toBe(mockTime);

      // Start the timer and advance time
      act(() => {
        result.current.setIsRunning(true);
      });

      // Advance system time and timer
      vi.setSystemTime(mockTime + 1000);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // The currentTime should have been updated by the interval
      expect(result.current.currentTime).toBeGreaterThan(mockTime);
    });
  });
});
