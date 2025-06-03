import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Check,
  Edit2,
  History,
  ListChecks,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
  X,
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
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState("");

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

  const addNewAgendaItem = () => {
    const newItem: AgendaItem = {
      id: Date.now().toString(),
      name: "",
      estimatedMinutes: 5,
      isActive: false,
      elapsedTime: 0,
    };
    setAgendaItems([...agendaItems, newItem]);
    setEditingItem(newItem.id);
    setEditName("");
    setEditTime("5");
  };

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

  const loadMeeting = (meeting: Meeting) => {
    setAgendaItems(
      meeting.agendaItems.map((item) => ({
        ...item,
        isActive: false,
        startTime: undefined,
        elapsedTime: 0,
      })),
    );
    setIsRunning(false);
  };

  const getCurrentElapsed = (item: AgendaItem): number => {
    if (item.isActive && item.startTime) {
      return item.elapsedTime + (currentTime - item.startTime);
    }
    return item.elapsedTime;
  };

  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalEstimated = agendaItems.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0,
  );
  const totalActual = agendaItems.reduce(
    (sum, item) => sum + (item.actualMinutes || 0),
    0,
  );

  const getTimeDifference = (estimated: number, actual: number): string => {
    const diff = actual - estimated;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${formatTime(Math.abs(diff))}`;
  };

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

  const startEditing = (item: AgendaItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditTime(item.estimatedMinutes.toString());
  };

  const saveEdit = () => {
    if (editingItem && editName.trim() && editTime) {
      editAgendaItem(editingItem, editName.trim(), Number.parseInt(editTime));
      setEditingItem(null);
      setEditName("");
      setEditTime("");
    }
  };

  const cancelEdit = () => {
    if (editingItem) {
      const item = agendaItems.find((item) => item.id === editingItem);
      if (item && item.name === "") {
        // If it's a new empty item, remove it
        setAgendaItems((items) =>
          items.filter((item) => item.id !== editingItem),
        );
      }
    }
    setEditingItem(null);
    setEditName("");
    setEditTime("");
  };

  const totalElapsed = agendaItems.reduce((sum, item) => {
    if (item.actualMinutes) return sum + item.actualMinutes * 60000;
    return sum + getCurrentElapsed(item);
  }, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Visual header with icons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
            {t("meeting.title")}
          </h1>
          <ListChecks className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        {/* Unified Agenda Management */}
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
              {t("agenda.management")}
            </h2>
          </div>
        </div>

        {/* Agenda items list and add button */}
        <div className="border-t border-border pt-4">
          <h3 className="text-md font-medium text-muted-foreground mb-3">
            {agendaItems.length > 0
              ? t("agenda.currentItems")
              : t("agenda.itemsList")}
          </h3>
          <div className="space-y-3">
            {agendaItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  item.isActive
                    ? "bg-primary/10 border-primary"
                    : "bg-muted border-border"
                }`}
              >
                {editingItem === item.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-20 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t("time.minutes")}
                      </span>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-card-foreground">
                        {item.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("agenda.estimated")}{" "}
                        {formatTime(item.estimatedMinutes)}
                        {item.actualMinutes &&
                          ` • ${t("agenda.actual")} ${formatTime(item.actualMinutes)}`}
                        {item.isActive && ` • ${t("agenda.inProgress")}`}
                      </div>
                    </div>
                    {!item.isActive && !item.actualMinutes && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title={t("button.edit")}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAgendaItem(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title={t("button.delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
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

          {/* Progress visualization */}
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-card-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t("meeting.progress")}
            </h2>
            <MeetingProgress
              items={agendaItems}
              onItemClick={(index) => {
                if (agendaItems[index].isActive) {
                  completeCurrentItem();
                }
              }}
            />
          </div>
        </div>
      )}

      {meetingHistory.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-card-foreground">
            {t("history.title")}
          </h2>
          <div className="space-y-3">
            {meetingHistory.map((meeting) => (
              <div
                key={meeting.id}
                className="flex justify-between items-center p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(meeting.date).toLocaleDateString()} -{" "}
                    {meeting.agendaItems.length} {t("history.items")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("history.total")}{" "}
                    {formatTime(
                      meeting.agendaItems.reduce(
                        (sum, item) => sum + (item.actualMinutes || 0),
                        0,
                      ),
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadMeeting(meeting)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors min-h-[40px]"
                >
                  {t("button.load")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
