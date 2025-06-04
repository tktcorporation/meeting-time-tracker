import { useEffect, useState } from "react";

export interface AgendaItem {
  id: string;
  name: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  isActive: boolean;
  startTime?: number;
  elapsedTime: number;
}

export interface Meeting {
  id: string;
  date: string;
  agendaItems: AgendaItem[];
}

/**
 * Custom hook for managing meeting state and persistence.
 *
 * This hook provides comprehensive meeting state management including:
 * - Managing agenda items with automatic localStorage persistence
 * - Meeting history management with localStorage persistence
 * - Session restoration from localStorage on initialization
 * - Sample data initialization when no saved session exists
 *
 * The hook automatically saves the active session to localStorage whenever
 * agendaItems or isRunning state changes, enabling persistence across
 * browser sessions and tab switches.
 *
 * @param isRunning - Current timer running state for session persistence
 * @returns Object containing meeting state and management functions
 * @returns returns.agendaItems - Array of current agenda items
 * @returns returns.setAgendaItems - Function to update agenda items
 * @returns returns.meetingHistory - Array of saved meeting history (max 10 items)
 * @returns returns.setMeetingHistory - Function to update meeting history
 * @returns returns.saveMeeting - Function to save current meeting to history
 * @returns returns.resetSession - Function to reset current session and clear localStorage
 *
 * @example
 * ```tsx
 * const {
 *   agendaItems,
 *   setAgendaItems,
 *   meetingHistory,
 *   saveMeeting,
 *   resetSession
 * } = useMeetingState(isRunning);
 *
 * // Add a new agenda item
 * const newItem = {
 *   id: Date.now().toString(),
 *   name: "New Item",
 *   estimatedMinutes: 10,
 *   isActive: false,
 *   elapsedTime: 0
 * };
 * setAgendaItems([...agendaItems, newItem]);
 *
 * // Save meeting when complete
 * if (allItemsComplete) {
 *   saveMeeting();
 * }
 * ```
 */
export function useMeetingState(isRunning: boolean) {
  /**
   * Initialize agenda items state with session restoration or sample data.
   * Attempts to restore from localStorage first, recalculating elapsed times
   * for active items based on saved timestamps.
   */
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(() => {
    // Try to restore active session from localStorage
    try {
      const savedSession = localStorage.getItem("active-meeting-session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        // Update elapsed times based on saved timestamps
        return session.agendaItems.map((item: AgendaItem) => {
          if (item.isActive && item.startTime) {
            // Calculate elapsed time since browser was closed
            const additionalElapsed = Date.now() - item.startTime;
            return {
              ...item,
              elapsedTime: item.elapsedTime + additionalElapsed,
              startTime: Date.now(), // Reset start time to now
            };
          }
          return item;
        });
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
    }

    // Initialize with sample data if no saved session
    const now = Date.now();
    return [
      {
        id: `sample_${now}_1`,
        name: "プロジェクト概要説明",
        estimatedMinutes: 5,
        isActive: false,
        elapsedTime: 0,
      },
      {
        id: `sample_${now}_2`,
        name: "進捗報告",
        estimatedMinutes: 10,
        isActive: false,
        elapsedTime: 0,
      },
      {
        id: `sample_${now}_3`,
        name: "課題とディスカッション",
        estimatedMinutes: 15,
        isActive: false,
        elapsedTime: 0,
      },
      {
        id: `sample_${now}_4`,
        name: "次回アクション確認",
        estimatedMinutes: 5,
        isActive: false,
        elapsedTime: 0,
      },
    ];
  });

  /**
   * Initialize meeting history state from localStorage.
   */
  const [meetingHistory, setMeetingHistory] = useState<Meeting[]>([]);

  /**
   * Load meeting history from localStorage on component mount.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("meeting-history");
      if (saved) {
        setMeetingHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load meeting history:", e);
    }
  }, []);

  /**
   * Save active session to localStorage whenever state changes.
   * This effect ensures persistence across browser sessions and tab switches.
   */
  useEffect(() => {
    try {
      const sessionData = {
        agendaItems,
        isRunning,
        savedAt: Date.now(),
      };
      localStorage.setItem(
        "active-meeting-session",
        JSON.stringify(sessionData),
      );
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  }, [agendaItems, isRunning]);

  /**
   * Saves the current meeting to history and clears the active session.
   * Only saves meetings that have at least one completed agenda item.
   * Maintains a maximum of 10 meetings in history.
   */
  const saveMeeting = () => {
    if (
      agendaItems.length > 0 &&
      agendaItems.some((item) => item.actualMinutes)
    ) {
      try {
        const meeting: Meeting = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          agendaItems: agendaItems.filter((item) => item.actualMinutes),
        };
        const updatedHistory = [meeting, ...meetingHistory].slice(0, 10);
        setMeetingHistory(updatedHistory);
        localStorage.setItem("meeting-history", JSON.stringify(updatedHistory));
        // Clear active session after saving
        localStorage.removeItem("active-meeting-session");
      } catch (e) {
        console.error("Failed to save meeting:", e);
      }
    }
  };

  /**
   * Resets the current session by clearing all agenda items' progress
   * and removing the active session from localStorage.
   */
  const resetSession = () => {
    setAgendaItems((items) =>
      items.map((item) => ({
        ...item,
        isActive: false,
        actualMinutes: undefined,
        startTime: undefined,
        elapsedTime: 0,
      })),
    );
    // Clear the active session from localStorage
    try {
      localStorage.removeItem("active-meeting-session");
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
  };

  return {
    agendaItems,
    setAgendaItems,
    meetingHistory,
    setMeetingHistory,
    saveMeeting,
    resetSession,
  };
}
