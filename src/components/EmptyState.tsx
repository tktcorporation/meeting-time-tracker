import { BarChart3, Clock, Plus, Sparkles, Users } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface EmptyStateProps {
  onAddSample?: () => void;
}

export function EmptyState({ onAddSample }: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Large visual clock icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <Clock
          className="w-32 h-32 text-primary relative z-10"
          strokeWidth={1.5}
        />
      </div>

      {/* Visual flow diagram */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">
            {t("onboarding.step1")}
          </span>
        </div>
        <div className="w-12 h-0.5 bg-border" />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">
            {t("onboarding.step2")}
          </span>
        </div>
        <div className="w-12 h-0.5 bg-border" />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">
            {t("onboarding.step3")}
          </span>
        </div>
      </div>

      {/* Demo button with sparkle effect */}
      <button
        type="button"
        onClick={onAddSample}
        disabled={!onAddSample}
        className="group relative px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {t("onboarding.tryDemo")}
        </span>
        <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
