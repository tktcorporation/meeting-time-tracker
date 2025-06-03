import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  History,
  ListChecks,
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
    // Initialize with sample data
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
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [meetingHistory, setMeetingHistory] = useState<Meeting[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("meeting-history");
    if (saved) {
      setMeetingHistory(JSON.parse(saved));
    }
  }, []);

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

  const completedItems = agendaItems.filter((item) => item.actualMinutes);
  const allItemsComplete =
    agendaItems.length > 0 && agendaItems.every((item) => item.actualMinutes);

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

  const totalElapsed = agendaItems.reduce((sum, item) => {
    if (item.actualMinutes) return sum + item.actualMinutes * 60000;
    return sum + getCurrentElapsed(item);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
        {/* Unified Agenda Management and Progress */}
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <ListChecks className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
              {t("agenda.management")}
            </h2>
          </div>
          <MeetingProgress
            items={agendaItems}
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
        </div>

        {agendaItems.length > 0 && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Timer display */}
            <div>
              <MeetingTimer totalElapsed={totalElapsed} isRunning={isRunning} />

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
                <button
                  type="button"
                  onClick={resetMeeting}
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center gap-2 min-h-[48px] font-medium"
                >
                  <RotateCcw size={18} />
                  {t("button.reset")}
                </button>
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
                {completedItems.length > 0 && (
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
          </div>
        )}
      </main>
    </div>
  );
}
