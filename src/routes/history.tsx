import { useLanguage } from "@/contexts/LanguageContext";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Meeting history route component
 * Displays a list of past meetings with their details and outcomes
 */
export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

/**
 * History page component that shows meeting history
 * Provides interface for viewing past meetings and their retrospectives
 */
function HistoryPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            {t("meetingHistory")}
          </h1>

          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Clock icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">
              {t("noMeetingHistory")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("noMeetingHistoryDescription")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
