import { Link, createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export const Route = createFileRoute("/retrospective")({
  component: Retrospective,
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

function Retrospective() {
  const { t } = useLanguage();
  const [meetingHistory, setMeetingHistory] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("meeting-history");
    if (saved) {
      const history = JSON.parse(saved);
      setMeetingHistory(history);
      if (history.length > 0) {
        setSelectedMeeting(history[0]);
      }
    }
  }, []);

  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeDifference = (estimated: number, actual: number): string => {
    const diff = actual - estimated;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${formatTime(Math.abs(diff))}`;
  };

  if (meetingHistory.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto p-6 pb-20">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">
              {t("retrospective.noData")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("retrospective.noDataDescription")}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t("retrospective.startFirstMeeting")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completedItems =
    selectedMeeting?.agendaItems.filter((item) => item.actualMinutes) || [];
  const totalEstimated = completedItems.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0,
  );
  const totalActual = completedItems.reduce(
    (sum, item) => sum + (item.actualMinutes || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto p-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Meeting History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 text-card-foreground">
                {t("history.title")}
              </h2>
              <div className="space-y-2">
                {meetingHistory.map((meeting) => (
                  <button
                    key={meeting.id}
                    type="button"
                    onClick={() => setSelectedMeeting(meeting)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedMeeting?.id === meeting.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {new Date(meeting.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs opacity-75">
                      {meeting.agendaItems.length} {t("history.items")} •{" "}
                      {formatTime(
                        meeting.agendaItems.reduce(
                          (sum, item) => sum + (item.actualMinutes || 0),
                          0,
                        ),
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedMeeting && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-primary">
                      {t("retrospective.totalEstimated")}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {formatTime(totalEstimated)}
                    </p>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700 dark:text-green-500">
                      {t("retrospective.totalActual")}
                    </h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                      {formatTime(totalActual)}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      totalActual > totalEstimated
                        ? "bg-destructive/10"
                        : "bg-green-500/10"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        totalActual > totalEstimated
                          ? "text-destructive"
                          : "text-green-700 dark:text-green-500"
                      }`}
                    >
                      {t("retrospective.overallDifference")}
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        totalActual > totalEstimated
                          ? "text-destructive"
                          : "text-green-600 dark:text-green-500"
                      }`}
                    >
                      {getTimeDifference(totalEstimated, totalActual)}
                    </p>
                  </div>
                </div>

                {/* Detailed Analysis Table */}
                <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                  <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                    {t("retrospective.timeAnalysis")} -{" "}
                    {new Date(selectedMeeting.date).toLocaleDateString()}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left py-2 px-4 border-b border-border">
                            {t("table.topicName")}
                          </th>
                          <th className="text-center py-2 px-4 border-b border-border">
                            {t("table.estimated")}
                          </th>
                          <th className="text-center py-2 px-4 border-b border-border">
                            {t("table.actual")}
                          </th>
                          <th className="text-center py-2 px-4 border-b border-border">
                            {t("table.difference")}
                          </th>
                          <th className="text-center py-2 px-4 border-b border-border">
                            {t("table.accuracy")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedItems.map((item) => {
                          const difference =
                            (item.actualMinutes ?? 0) - item.estimatedMinutes;
                          const accuracy = Math.round(
                            (1 - Math.abs(difference) / item.estimatedMinutes) *
                              100,
                          );

                          return (
                            <tr key={item.id}>
                              <td className="py-3 px-4 border-b border-border">
                                {item.name}
                              </td>
                              <td className="text-center py-3 px-4 border-b border-border">
                                {formatTime(item.estimatedMinutes)}
                              </td>
                              <td className="text-center py-3 px-4 border-b border-border">
                                {formatTime(item.actualMinutes ?? 0)}
                              </td>
                              <td
                                className={`text-center py-3 px-4 border-b border-border font-semibold ${
                                  difference > 0
                                    ? "text-destructive"
                                    : difference < 0
                                      ? "text-green-600 dark:text-green-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {getTimeDifference(
                                  item.estimatedMinutes,
                                  item.actualMinutes ?? 0,
                                )}
                              </td>
                              <td
                                className={`text-center py-3 px-4 border-b border-border font-semibold ${
                                  accuracy >= 80
                                    ? "text-green-600 dark:text-green-500"
                                    : accuracy >= 60
                                      ? "text-yellow-600 dark:text-yellow-500"
                                      : "text-destructive"
                                }`}
                              >
                                {accuracy}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
