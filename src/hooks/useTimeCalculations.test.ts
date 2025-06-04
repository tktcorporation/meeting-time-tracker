import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AgendaItem } from "./useMeetingState";
import { useTimeCalculations } from "./useTimeCalculations";

/**
 * Test suite for useTimeCalculations hook.
 *
 * Tests time calculations and visibility handling including:
 * - getCurrentElapsed function for active/inactive items
 * - totalElapsed and totalEstimated calculations
 * - visibility change handling for background tracking
 * - document event listener management
 * - edge cases and error scenarios
 */
describe("useTimeCalculations", () => {
  let mockSetAgendaItems: ReturnType<typeof vi.fn>;
  let mockAgendaItems: AgendaItem[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1609459200000); // Fixed timestamp: 2021-01-01 00:00:00

    mockSetAgendaItems = vi.fn();

    // Create mock agenda items
    mockAgendaItems = [
      {
        id: "item_1",
        name: "Inactive Item",
        estimatedMinutes: 10,
        isActive: false,
        elapsedTime: 300000, // 5 minutes
      },
      {
        id: "item_2",
        name: "Active Item",
        estimatedMinutes: 15,
        isActive: true,
        elapsedTime: 240000, // 4 minutes
        startTime: Date.now() - 60000, // Started 1 minute ago
      },
      {
        id: "item_3",
        name: "Completed Item",
        estimatedMinutes: 20,
        actualMinutes: 18,
        isActive: false,
        elapsedTime: 1080000, // 18 minutes
      },
    ];

    // Mock document.hidden property
    Object.defineProperty(document, "hidden", {
      writable: true,
      value: false,
    });

    // Clear any existing event listeners
    document.removeEventListener = vi.fn();
    document.addEventListener = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("getCurrentElapsed function", () => {
    it("should return elapsedTime for inactive items", () => {
      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          currentTime,
          false,
          mockSetAgendaItems,
        ),
      );

      const inactiveItem = mockAgendaItems[0];
      const elapsed = result.current.getCurrentElapsed(inactiveItem);

      expect(elapsed).toBe(300000); // Should return stored elapsedTime
    });

    it("should calculate current elapsed time for active items with startTime", () => {
      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          currentTime,
          true,
          mockSetAgendaItems,
        ),
      );

      const activeItem = mockAgendaItems[1];
      const elapsed = result.current.getCurrentElapsed(activeItem);

      // Should be elapsedTime (240000) + time since start (60000) = 300000
      expect(elapsed).toBe(300000);
    });

    it("should return elapsedTime for active items without startTime", () => {
      const itemWithoutStartTime: AgendaItem = {
        ...mockAgendaItems[1],
        startTime: undefined,
      };

      const modifiedItems = [...mockAgendaItems];
      modifiedItems[1] = itemWithoutStartTime;

      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          modifiedItems,
          currentTime,
          true,
          mockSetAgendaItems,
        ),
      );

      const elapsed = result.current.getCurrentElapsed(itemWithoutStartTime);
      expect(elapsed).toBe(240000); // Should return stored elapsedTime
    });

    it("should update when currentTime changes", () => {
      let currentTime = Date.now();
      const { result, rerender } = renderHook(
        ({ time }) =>
          useTimeCalculations(mockAgendaItems, time, true, mockSetAgendaItems),
        { initialProps: { time: currentTime } },
      );

      const activeItem = mockAgendaItems[1];
      const initialElapsed = result.current.getCurrentElapsed(activeItem);

      // Advance current time by 30 seconds
      currentTime += 30000;
      rerender({ time: currentTime });

      const newElapsed = result.current.getCurrentElapsed(activeItem);
      expect(newElapsed).toBe(initialElapsed + 30000);
    });

    it("should handle items with zero elapsedTime", () => {
      const freshItem: AgendaItem = {
        id: "fresh_item",
        name: "Fresh Item",
        estimatedMinutes: 5,
        isActive: true,
        elapsedTime: 0,
        startTime: Date.now() - 30000, // Started 30 seconds ago
      };

      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations([freshItem], currentTime, true, mockSetAgendaItems),
      );

      const elapsed = result.current.getCurrentElapsed(freshItem);
      expect(elapsed).toBe(30000); // Should be 30 seconds
    });
  });

  describe("totalElapsed calculation", () => {
    it("should calculate total elapsed time across all items", () => {
      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          currentTime,
          true,
          mockSetAgendaItems,
        ),
      );

      // Item 1: 300000ms (inactive)
      // Item 2: 300000ms (active, 240000 + 60000)
      // Item 3: 1080000ms (completed, uses actualMinutes: 18 * 60000)
      const expectedTotal = 300000 + 300000 + 18 * 60000;

      expect(result.current.totalElapsed).toBe(expectedTotal);
    });

    it("should use actualMinutes for completed items", () => {
      const completedItem: AgendaItem = {
        id: "completed",
        name: "Completed Item",
        estimatedMinutes: 10,
        actualMinutes: 12, // Took longer than estimated
        isActive: false,
        elapsedTime: 720000, // 12 minutes in ms
      };

      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          [completedItem],
          currentTime,
          false,
          mockSetAgendaItems,
        ),
      );

      // Should use actualMinutes (12 * 60000) instead of elapsedTime
      expect(result.current.totalElapsed).toBe(12 * 60000);
    });

    it("should handle empty agenda items", () => {
      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations([], currentTime, false, mockSetAgendaItems),
      );

      expect(result.current.totalElapsed).toBe(0);
    });

    it("should update when currentTime changes for active items", () => {
      let currentTime = Date.now();
      const { result, rerender } = renderHook(
        ({ time }) =>
          useTimeCalculations(mockAgendaItems, time, true, mockSetAgendaItems),
        { initialProps: { time: currentTime } },
      );

      const initialTotal = result.current.totalElapsed;

      // Advance time by 1 minute
      currentTime += 60000;
      rerender({ time: currentTime });

      const newTotal = result.current.totalElapsed;
      expect(newTotal).toBe(initialTotal + 60000); // Should increase by 1 minute
    });
  });

  describe("totalEstimated calculation", () => {
    it("should calculate total estimated time across all items", () => {
      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          currentTime,
          false,
          mockSetAgendaItems,
        ),
      );

      // Item 1: 10 minutes, Item 2: 15 minutes, Item 3: 20 minutes
      const expectedTotal = (10 + 15 + 20) * 60000;

      expect(result.current.totalEstimated).toBe(expectedTotal);
    });

    it("should handle empty agenda items", () => {
      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations([], currentTime, false, mockSetAgendaItems),
      );

      expect(result.current.totalEstimated).toBe(0);
    });

    it("should not change when currentTime changes", () => {
      let currentTime = Date.now();
      const { result, rerender } = renderHook(
        ({ time }) =>
          useTimeCalculations(mockAgendaItems, time, true, mockSetAgendaItems),
        { initialProps: { time: currentTime } },
      );

      const initialTotal = result.current.totalEstimated;

      // Advance time
      currentTime += 60000;
      rerender({ time: currentTime });

      expect(result.current.totalEstimated).toBe(initialTotal);
    });
  });

  describe("visibility change handling", () => {
    it("should add event listener on mount when timer is running", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          true,
          mockSetAgendaItems,
        ),
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
    });

    it("should add event listener on mount when timer is not running", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          false,
          mockSetAgendaItems,
        ),
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
    });

    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          true,
          mockSetAgendaItems,
        ),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
    });

    it("should update active items when tab becomes hidden and timer is running", () => {
      // Mock the event listener to capture the handler
      let visibilityHandler: () => void;
      vi.spyOn(document, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler as () => void;
          }
        },
      );

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          true,
          mockSetAgendaItems,
        ),
      );

      // Simulate tab becoming hidden
      Object.defineProperty(document, "hidden", { value: true });

      act(() => {
        visibilityHandler();
      });

      expect(mockSetAgendaItems).toHaveBeenCalledWith(expect.any(Function));

      // Test the updater function
      const updaterFunction = mockSetAgendaItems.mock.calls[0][0];
      const updatedItems = updaterFunction(mockAgendaItems);

      // Active item should have updated elapsedTime and startTime
      const updatedActiveItem = updatedItems.find(
        (item: AgendaItem) => item.isActive,
      );
      expect(updatedActiveItem.elapsedTime).toBeGreaterThan(
        mockAgendaItems[1].elapsedTime,
      );
      expect(updatedActiveItem.startTime).toBe(Date.now());
    });

    it("should not update items when tab becomes hidden and timer is not running", () => {
      let visibilityHandler: () => void;
      vi.spyOn(document, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler as () => void;
          }
        },
      );

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          false,
          mockSetAgendaItems,
        ),
      );

      // Simulate tab becoming hidden
      Object.defineProperty(document, "hidden", { value: true });

      act(() => {
        visibilityHandler();
      });

      expect(mockSetAgendaItems).not.toHaveBeenCalled();
    });

    it("should restore active items when tab becomes visible and timer is running", () => {
      let visibilityHandler: () => void;
      vi.spyOn(document, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler as () => void;
          }
        },
      );

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          true,
          mockSetAgendaItems,
        ),
      );

      // Simulate tab becoming visible (document.hidden = false is already set in beforeEach)
      act(() => {
        visibilityHandler();
      });

      expect(mockSetAgendaItems).toHaveBeenCalledWith(expect.any(Function));

      // Test the updater function
      const updaterFunction = mockSetAgendaItems.mock.calls[0][0];
      const updatedItems = updaterFunction(mockAgendaItems);

      // Active item should have fresh startTime
      const updatedActiveItem = updatedItems.find(
        (item: AgendaItem) => item.isActive,
      );
      expect(updatedActiveItem.startTime).toBe(Date.now());
    });

    it("should not update items when tab becomes visible and timer is not running", () => {
      let visibilityHandler: () => void;
      vi.spyOn(document, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler as () => void;
          }
        },
      );

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          false,
          mockSetAgendaItems,
        ),
      );

      // Simulate tab becoming visible
      act(() => {
        visibilityHandler();
      });

      expect(mockSetAgendaItems).not.toHaveBeenCalled();
    });

    it("should handle multiple visibility changes correctly", () => {
      let visibilityHandler: () => void;
      vi.spyOn(document, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler as () => void;
          }
        },
      );

      renderHook(() =>
        useTimeCalculations(
          mockAgendaItems,
          Date.now(),
          true,
          mockSetAgendaItems,
        ),
      );

      // Simulate multiple visibility changes
      Object.defineProperty(document, "hidden", { value: true });
      act(() => {
        visibilityHandler();
      });

      Object.defineProperty(document, "hidden", { value: false });
      act(() => {
        visibilityHandler();
      });

      Object.defineProperty(document, "hidden", { value: true });
      act(() => {
        visibilityHandler();
      });

      expect(mockSetAgendaItems).toHaveBeenCalledTimes(3);
    });

    it("should only update active items during visibility changes", () => {
      const itemsWithMultipleActive: AgendaItem[] = [
        {
          id: "item_1",
          name: "Inactive Item",
          estimatedMinutes: 10,
          isActive: false,
          elapsedTime: 300000,
        },
        {
          id: "item_2",
          name: "Active Item 1",
          estimatedMinutes: 15,
          isActive: true,
          elapsedTime: 240000,
          startTime: Date.now() - 60000,
        },
        {
          id: "item_3",
          name: "Active Item 2",
          estimatedMinutes: 20,
          isActive: true,
          elapsedTime: 180000,
          startTime: Date.now() - 30000,
        },
      ];

      let visibilityHandler: () => void;
      vi.spyOn(document, "addEventListener").mockImplementation(
        (event, handler) => {
          if (event === "visibilitychange") {
            visibilityHandler = handler as () => void;
          }
        },
      );

      renderHook(() =>
        useTimeCalculations(
          itemsWithMultipleActive,
          Date.now(),
          true,
          mockSetAgendaItems,
        ),
      );

      // Simulate tab becoming visible
      act(() => {
        visibilityHandler();
      });

      const updaterFunction = mockSetAgendaItems.mock.calls[0][0];
      const updatedItems = updaterFunction(itemsWithMultipleActive);

      // Only active items should be updated
      const inactiveItem = updatedItems[0];
      const activeItem1 = updatedItems[1];
      const activeItem2 = updatedItems[2];

      expect(inactiveItem.startTime).toBeUndefined(); // Should remain unchanged
      expect(activeItem1.startTime).toBe(Date.now()); // Should be updated
      expect(activeItem2.startTime).toBe(Date.now()); // Should be updated
    });
  });

  describe("hook dependencies and updates", () => {
    it("should recreate event listener when isRunning changes", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      const { rerender } = renderHook(
        ({ isRunning }) =>
          useTimeCalculations(
            mockAgendaItems,
            Date.now(),
            isRunning,
            mockSetAgendaItems,
          ),
        { initialProps: { isRunning: true } },
      );

      // Change isRunning
      rerender({ isRunning: false });

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2); // Once on mount, once on update
    });

    it("should recreate event listener when setAgendaItems changes", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      const newSetAgendaItems = vi.fn();

      const { rerender } = renderHook(
        ({ setter }) =>
          useTimeCalculations(mockAgendaItems, Date.now(), true, setter),
        { initialProps: { setter: mockSetAgendaItems } },
      );

      // Change setAgendaItems function
      rerender({ setter: newSetAgendaItems });

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it("should memoize getCurrentElapsed function based on currentTime", () => {
      const { result, rerender } = renderHook(
        ({ time }) =>
          useTimeCalculations(mockAgendaItems, time, false, mockSetAgendaItems),
        { initialProps: { time: Date.now() } },
      );

      const firstGetCurrentElapsed = result.current.getCurrentElapsed;

      // Rerender with same currentTime
      rerender({ time: Date.now() });

      // Function should be memoized (same reference)
      expect(result.current.getCurrentElapsed).toBe(firstGetCurrentElapsed);

      // Rerender with different currentTime
      rerender({ time: Date.now() + 1000 });

      // Function should be recreated
      expect(result.current.getCurrentElapsed).not.toBe(firstGetCurrentElapsed);
    });
  });

  describe("edge cases", () => {
    it("should handle items with future startTime gracefully", () => {
      const futureItem: AgendaItem = {
        id: "future_item",
        name: "Future Item",
        estimatedMinutes: 10,
        isActive: true,
        elapsedTime: 60000,
        startTime: Date.now() + 30000, // 30 seconds in the future
      };

      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          [futureItem],
          currentTime,
          true,
          mockSetAgendaItems,
        ),
      );

      const elapsed = result.current.getCurrentElapsed(futureItem);
      // Should handle negative time gracefully (likely return elapsedTime)
      expect(elapsed).toBeLessThanOrEqual(60000);
    });

    it("should handle very large elapsed times", () => {
      const longRunningItem: AgendaItem = {
        id: "long_item",
        name: "Long Running Item",
        estimatedMinutes: 60,
        isActive: false,
        elapsedTime: Number.MAX_SAFE_INTEGER - 1000,
      };

      const currentTime = Date.now();
      const { result } = renderHook(() =>
        useTimeCalculations(
          [longRunningItem],
          currentTime,
          false,
          mockSetAgendaItems,
        ),
      );

      expect(result.current.totalElapsed).toBe(Number.MAX_SAFE_INTEGER - 1000);
    });
  });
});
