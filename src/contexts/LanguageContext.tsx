import { type ReactNode, createContext, useContext, useState } from "react";

type Language = "en" | "ja";

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  en: {
    "meeting.title": "Meeting Time Tracker",
    "meeting.retrospective": "Meeting Retrospective",
    "meeting.backToTracker": "Back to Tracker",
    "agenda.management": "Agenda Management",
    "agenda.add": "Add Agenda Item",
    "agenda.addNew": "Add New Item",
    "agenda.itemsList": "Agenda Items",
    "agenda.topicName": "Topic Name",
    "agenda.topicNamePlaceholder": "Enter topic name",
    "agenda.estimatedTime": "Estimated Time (minutes)",
    "agenda.estimatedTimePlaceholder": "5",
    "button.add": "Add",
    "meeting.progress": "Meeting Progress",
    "meeting.complete": "complete",
    "button.startMeeting": "Start Meeting",
    "button.pause": "Pause",
    "button.reset": "Reset",
    "button.saveMeeting": "Save Meeting",
    "button.retrospective": "Retrospective",
    "button.nextAgenda": "Next Agenda",
    "button.previousAgenda": "Previous Agenda",
    "button.startNext": "Start Next",
    "table.topicName": "Topic Name",
    "table.estimated": "Estimated",
    "table.actual": "Actual",
    "table.status": "Status",
    "table.action": "Action",
    "table.difference": "Difference",
    "table.accuracy": "Accuracy",
    "button.complete": "Complete",
    "status.complete": "Complete",
    "status.inProgress": "In Progress",
    "status.overtime": "Overtime!",
    "status.pending": "Pending",
    "total.time": "Total Time:",
    "total.estimated": "estimated",
    "total.actual": "actual",
    "history.title": "Meeting History",
    "history.items": "items",
    "history.total": "Total:",
    "button.load": "Load",
    "retrospective.timeAnalysis": "Time Analysis",
    "retrospective.totalEstimated": "Total Estimated",
    "retrospective.totalActual": "Total Actual",
    "retrospective.overallDifference": "Overall Difference",
    appTitle: "Meeting Tracker",
    meetingHistory: "Meeting History",
    noMeetingHistory: "No Meeting History",
    noMeetingHistoryDescription:
      "You haven't completed any meetings yet. Start tracking to build your meeting history.",
    "nav.home": "Home",
    "nav.tracker": "Tracker",
    "nav.history": "History",
    "nav.retrospective": "Retrospective",
    "nav.toggleLanguage": "Toggle Language",
    "nav.toggleTheme": "Toggle Theme",
    "onboarding.step1": "Add Topics",
    "onboarding.step2": "Track Time",
    "onboarding.step3": "Review Results",
    "onboarding.tryDemo": "Try Demo Meeting",
    "retrospective.noData": "No Meeting Data",
    "retrospective.noDataDescription":
      "You haven't completed any meetings yet. Start tracking a meeting to view retrospective analysis.",
    "retrospective.startFirstMeeting": "Start Your First Meeting",
    "agenda.currentItems": "Current Items",
    "agenda.estimated": "Est:",
    "agenda.actual": "Actual:",
    "agenda.inProgress": "In Progress",
    "button.edit": "Edit",
    "button.delete": "Delete",
    "button.save": "Save",
    "button.cancel": "Cancel",
    "time.minutes": "min",
  },
  ja: {
    "meeting.title": "会議時間トラッカー",
    "meeting.retrospective": "会議振り返り",
    "meeting.backToTracker": "トラッカーに戻る",
    "agenda.management": "アジェンダ管理",
    "agenda.add": "アジェンダ項目追加",
    "agenda.addNew": "新しい項目を追加",
    "agenda.itemsList": "アジェンダ項目一覧",
    "agenda.topicName": "トピック名",
    "agenda.topicNamePlaceholder": "トピック名を入力",
    "agenda.estimatedTime": "予定時間（分）",
    "agenda.estimatedTimePlaceholder": "5",
    "button.add": "追加",
    "meeting.progress": "会議進行状況",
    "meeting.complete": "完了",
    "button.startMeeting": "会議開始",
    "button.pause": "一時停止",
    "button.reset": "リセット",
    "button.saveMeeting": "会議保存",
    "button.retrospective": "振り返り",
    "button.nextAgenda": "次のアジェンダ",
    "button.previousAgenda": "前のアジェンダ",
    "button.startNext": "次を開始",
    "table.topicName": "トピック名",
    "table.estimated": "予定",
    "table.actual": "実際",
    "table.status": "ステータス",
    "table.action": "アクション",
    "table.difference": "差分",
    "table.accuracy": "精度",
    "button.complete": "完了",
    "status.complete": "完了",
    "status.inProgress": "進行中",
    "status.overtime": "時間超過！",
    "status.pending": "待機中",
    "total.time": "合計時間:",
    "total.estimated": "予定",
    "total.actual": "実際",
    "history.title": "会議履歴",
    "history.items": "項目",
    "history.total": "合計:",
    "button.load": "読み込み",
    "retrospective.timeAnalysis": "時間分析",
    "retrospective.totalEstimated": "合計予定時間",
    "retrospective.totalActual": "合計実際時間",
    "retrospective.overallDifference": "全体差分",
    appTitle: "会議トラッカー",
    meetingHistory: "会議履歴",
    noMeetingHistory: "会議履歴なし",
    noMeetingHistoryDescription:
      "まだ会議を完了していません。トラッキングを開始して会議履歴を作成してください。",
    "nav.home": "ホーム",
    "nav.tracker": "トラッカー",
    "nav.history": "履歴",
    "nav.retrospective": "振り返り",
    "nav.toggleLanguage": "言語切替",
    "nav.toggleTheme": "テーマ切替",
    "onboarding.step1": "トピック追加",
    "onboarding.step2": "時間計測",
    "onboarding.step3": "結果確認",
    "onboarding.tryDemo": "デモ会議を試す",
    "retrospective.noData": "会議データなし",
    "retrospective.noDataDescription":
      "まだ会議を完了していません。会議の振り返り分析を表示するには、会議のトラッキングを開始してください。",
    "retrospective.startFirstMeeting": "最初の会議を開始",
    "agenda.currentItems": "現在の項目",
    "agenda.estimated": "予定:",
    "agenda.actual": "実際:",
    "agenda.inProgress": "進行中",
    "button.edit": "編集",
    "button.delete": "削除",
    "button.save": "保存",
    "button.cancel": "キャンセル",
    "time.minutes": "分",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved === "en" || saved === "ja") {
        return saved;
      }
      return navigator.language.startsWith("ja") ? "ja" : "en";
    }
    return "en";
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
