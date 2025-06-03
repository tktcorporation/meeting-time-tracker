import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Languages, Moon, Sun, Timer } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <header className="p-2 flex gap-2 bg-background text-foreground border-b border-border justify-between">
      <nav className="flex flex-row items-center gap-1">
        <Link
          to="/"
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            currentPath === "/"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Timer size={16} />
          {t("nav.tracker")}
        </Link>
        <Link
          to="/retrospective"
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            currentPath === "/retrospective"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <BarChart3 size={16} />
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
  );
}
