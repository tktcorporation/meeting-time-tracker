import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  History,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MeetingProgress } from "../components/MeetingProgress";
import { MeetingTimer } from "../components/MeetingTimer";
import { useLanguage } from "../contexts/LanguageContext";

export const Route = createFileRoute("/")({
  component: MeetingTimeTracker,
});

interface AgendaItem {
  id: string;
  name: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  isActive: boolean;
  startTime?: number;
  elapsedTime: number;
}

interface Meeting {
  id: string;
  date: string;
  agendaItems: AgendaItem[];
}

function MeetingTimeTracker() {
  const { t } = useLanguage();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(() => {
    // Try to restore active session from localStorage
    const savedSession = localStorage.getItem("active-meeting-session");
    if (savedSession) {
      try {
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
      } catch (e) {
        console.error("Failed to restore session:", e);
      }
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
  const [isRunning, setIsRunning] = useState(() => {
    // Restore running state from localStorage
    const savedSession = localStorage.getItem("active-meeting-session");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        return session.isRunning || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [meetingHistory, setMeetingHistory] = useState<Meeting[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("meeting-history");
    if (saved) {
      setMeetingHistory(JSON.parse(saved));
    }
  }, []);

  // Save active session to localStorage whenever state changes
  useEffect(() => {
    const sessionData = {
      agendaItems,
      isRunning,
      savedAt: Date.now(),
    };
    localStorage.setItem("active-meeting-session", JSON.stringify(sessionData));
  }, [agendaItems, isRunning]);

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

  // Handle tab visibility changes to pause/resume timer properly
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
  }, [isRunning]);

  const startMeeting = () => {
    if (agendaItems.length > 0 && !isRunning) {
      setIsRunning(true);
      const firstIncompleteIndex = agendaItems.findIndex(
        (item) => !item.actualMinutes,
      );
      if (firstIncompleteIndex !== -1) {
        setAgendaItems((items) =>
          items.map((item, index) => ({
            ...item,
            isActive: index === firstIncompleteIndex,
            startTime:
              index === firstIncompleteIndex ? Date.now() : item.startTime,
          })),
        );
      }
    }
  };

  const pauseMeeting = () => {
    setIsRunning(false);
    setAgendaItems((items) =>
      items.map((item) => {
        if (item.isActive && item.startTime) {
          return {
            ...item,
            elapsedTime: item.elapsedTime + (Date.now() - item.startTime),
            startTime: undefined,
          };
        }
        return { ...item, isActive: false };
      }),
    );
  };

  const completeCurrentItem = () => {
    const activeIndex = agendaItems.findIndex((item) => item.isActive);
    if (activeIndex !== -1) {
      setAgendaItems((items) =>
        items.map((item, index) => {
          if (index === activeIndex) {
            const totalElapsed = item.startTime
              ? item.elapsedTime + (Date.now() - item.startTime)
              : item.elapsedTime;
            return {
              ...item,
              isActive: false,
              actualMinutes: Math.round((totalElapsed / 60000) * 10) / 10,
              startTime: undefined,
            };
          }
          if (index === activeIndex + 1 && isRunning) {
            return {
              ...item,
              isActive: true,
              startTime: Date.now(),
            };
          }
          return item;
        }),
      );
    }
  };

  const nextAgendaItem = () => {
    if (isRunning) {
      completeCurrentItem();
    } else {
      // If not running, just move to next incomplete item
      const nextIncompleteIndex = agendaItems.findIndex(
        (item) => !item.actualMinutes,
      );
      if (nextIncompleteIndex !== -1) {
        setAgendaItems((items) =>
          items.map((item, index) => ({
            ...item,
            isActive: index === nextIncompleteIndex,
            startTime: index === nextIncompleteIndex ? Date.now() : undefined,
          })),
        );
        setIsRunning(true);
      }
    }
  };

  const resetMeeting = () => {
    setIsRunning(false);
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
    localStorage.removeItem("active-meeting-session");
  };

  const saveMeeting = () => {
    if (
      agendaItems.length > 0 &&
      agendaItems.some((item) => item.actualMinutes)
    ) {
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
    }
  };

  // const loadMeeting = (meeting: Meeting) => {
  //   setAgendaItems(
  //     meeting.agendaItems.map((item) => ({
  //       ...item,
  //       isActive: false,
  //       startTime: undefined,
  //       elapsedTime: 0,
  //     })),
  //   );
  //   setIsRunning(false);
  // };

  const getCurrentElapsed = (item: AgendaItem): number => {
    if (item.isActive && item.startTime) {
      return item.elapsedTime + (currentTime - item.startTime);
    }
    return item.elapsedTime;
  };

  // const formatTime = (minutes: number): string => {
  //   const mins = Math.floor(minutes);
  //   const secs = Math.floor((minutes - mins) * 60);
  //   return `${mins}:${secs.toString().padStart(2, "0")}`;
  // };

  // const totalEstimated = agendaItems.reduce(
  //   (sum, item) => sum + item.estimatedMinutes,
  //   0,
  // );
  // const totalActual = agendaItems.reduce(
  //   (sum, item) => sum + (item.actualMinutes || 0),
  //   0,
  // );

  // const getTimeDifference = (estimated: number, actual: number): string => {
  //   const diff = actual - estimated;
  //   const sign = diff >= 0 ? "+" : "";
  //   return `${sign}${formatTime(Math.abs(diff))}`;
  // };

  // const completedItems = agendaItems.filter((item) => item.actualMinutes);
  const allItemsComplete =
    agendaItems.length > 0 && agendaItems.every((item) => item.actualMinutes);
  const hasActiveItem = agendaItems.some((item) => item.isActive);
  const hasNextItem = agendaItems.some((item) => !item.actualMinutes);

  const deleteAgendaItem = (id: string) => {
    setAgendaItems((items) => items.filter((item) => item.id !== id));
  };

  const editAgendaItem = (
    id: string,
    newName: string,
    newEstimatedMinutes: number,
  ) => {
    setAgendaItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, name: newName, estimatedMinutes: newEstimatedMinutes }
          : item,
      ),
    );
  };

  const reorderAgendaItems = (fromIndex: number, toIndex: number) => {
    setAgendaItems((items) => {
      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  };

  const totalElapsed = agendaItems.reduce((sum, item) => {
    if (item.actualMinutes) return sum + item.actualMinutes * 60000;
    return sum + getCurrentElapsed(item);
  }, 0);

  const totalEstimated = agendaItems.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
        {/* Timer display first */}
        {agendaItems.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <MeetingTimer
              totalElapsed={totalElapsed}
              totalEstimated={totalEstimated}
              isRunning={isRunning}
              agendaItems={agendaItems}
            />

            {/* Control buttons below timer */}
            <div className="flex gap-2 flex-wrap justify-center mt-4">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={startMeeting}
                  className="px-6 py-3 bg-green-600 dark:bg-green-600 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-700 transition-colors flex items-center gap-2 min-h-[48px] font-medium"
                >
                  <Play size={18} />
                  {t("button.startMeeting")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseMeeting}
                  className="px-6 py-3 bg-yellow-600 dark:bg-yellow-600 text-white rounded-md hover:bg-yellow-700 dark:hover:bg-yellow-700 transition-colors flex items-center gap-2 min-h-[48px] font-medium"
                >
                  <Pause size={18} />
                  {t("button.pause")}
                </button>
              )}
              {hasNextItem && (
                <button
                  type="button"
                  onClick={nextAgendaItem}
                  className="px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[48px] font-medium"
                >
                  <ChevronRight size={18} />
                  {hasActiveItem
                    ? t("button.nextAgenda")
                    : t("button.startNext")}
                </button>
              )}
              {allItemsComplete && (
                <button
                  type="button"
                  onClick={saveMeeting}
                  className="px-6 py-3 bg-purple-600 dark:bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-700 transition-colors flex items-center gap-2 min-h-[48px] font-medium"
                >
                  <History size={18} />
                  {t("button.saveMeeting")}
                </button>
              )}
              {allItemsComplete && (
                <Link
                  to="/retrospective"
                  className="px-6 py-3 bg-indigo-600 dark:bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors flex items-center gap-2 min-h-[48px] font-medium"
                >
                  <BarChart3 size={18} />
                  {t("button.retrospective")}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Agenda Management and Progress */}
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
              {t("agenda.management")}
            </h2>
          </div>
          <MeetingProgress
            items={agendaItems}
            isTimerRunning={isRunning}
            getCurrentElapsed={getCurrentElapsed}
            onItemClick={(index) => {
              if (agendaItems[index].isActive) {
                completeCurrentItem();
              }
            }}
            onItemEdit={(index, name, estimatedMinutes) => {
              editAgendaItem(agendaItems[index].id, name, estimatedMinutes);
            }}
            onItemDelete={(index) => {
              deleteAgendaItem(agendaItems[index].id);
            }}
            onItemReorder={reorderAgendaItems}
            onItemAdd={(name, estimatedMinutes) => {
              const newItem: AgendaItem = {
                id: Date.now().toString(),
                name,
                estimatedMinutes,
                isActive: false,
                elapsedTime: 0,
              };
              setAgendaItems([...agendaItems, newItem]);
            }}
            onAddSample={() => {
              const now = Date.now();
              const sampleItems = [
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
              setAgendaItems(sampleItems);
            }}
          />

          {/* Secondary actions */}
          <div className="mt-6 pt-4 border-t border-border flex justify-center">
            <button
              type="button"
              onClick={resetMeeting}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center gap-2 text-sm"
            >
              <RotateCcw size={16} />
              {t("button.reset")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
