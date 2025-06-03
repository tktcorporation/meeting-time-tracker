import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Clock, Home, Languages, Moon, Sun } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Header component that serves as top bar and mobile bottom navigation
 * Provides navigation between main routes and theme/language controls
 */
export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <>
      {/* Top header for desktop controls */}
      <header className="hidden sm:flex p-4 bg-background text-foreground border-b border-border justify-between items-center">
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              currentPath === "/"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Home size={18} />
            {t("nav.tracker")}
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              currentPath === "/history"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Clock size={18} />
            {t("nav.history")}
          </Link>
          <Link
            to="/retrospective"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              currentPath === "/retrospective"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BarChart3 size={18} />
            {t("nav.retrospective")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "ja" : "en")}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            title={t("nav.toggleLanguage")}
          >
            <Languages size={18} />
            <span className="ml-1 text-sm">
              {language === "en" ? "EN" : "JP"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            title={t("nav.toggleTheme")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile top header with controls only */}
      <header className="sm:hidden flex p-4 bg-background text-foreground border-b border-border justify-between items-center">
        <h1 className="text-lg font-semibold">{t("appTitle")}</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "ja" : "en")}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            title={t("nav.toggleLanguage")}
          >
            <Languages size={18} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            title={t("nav.toggleTheme")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb">
        <div className="grid grid-cols-3 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentPath === "/"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home size={20} />
            <span className="text-xs font-medium">{t("nav.tracker")}</span>
          </Link>

          <Link
            to="/history"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentPath === "/history"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock size={20} />
            <span className="text-xs font-medium">{t("nav.history")}</span>
          </Link>

          <Link
            to="/retrospective"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentPath === "/retrospective"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-xs font-medium">
              {t("nav.retrospective")}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
