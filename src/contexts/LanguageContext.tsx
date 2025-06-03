import { createContext, useContext, useState, type ReactNode } from 'react'

type Language = 'en' | 'ja'

interface Translations {
	[key: string]: string
}

interface LanguageContextType {
	language: Language
	setLanguage: (language: Language) => void
	t: (key: string) => string
}

const translations: Record<Language, Translations> = {
	en: {
		'meeting.title': 'Meeting Time Tracker',
		'meeting.retrospective': 'Meeting Retrospective',
		'meeting.backToTracker': 'Back to Tracker',
		'agenda.add': 'Add Agenda Item',
		'agenda.topicName': 'Topic Name',
		'agenda.topicNamePlaceholder': 'Enter topic name',
		'agenda.estimatedTime': 'Estimated Time (minutes)',
		'agenda.estimatedTimePlaceholder': '5',
		'button.add': 'Add',
		'meeting.progress': 'Meeting Progress',
		'button.startMeeting': 'Start Meeting',
		'button.pause': 'Pause',
		'button.reset': 'Reset',
		'button.saveMeeting': 'Save Meeting',
		'button.retrospective': 'Retrospective',
		'table.topicName': 'Topic Name',
		'table.estimated': 'Estimated',
		'table.actual': 'Actual',
		'table.status': 'Status',
		'table.action': 'Action',
		'table.difference': 'Difference',
		'table.accuracy': 'Accuracy',
		'button.complete': 'Complete',
		'status.complete': 'Complete',
		'status.inProgress': 'In Progress',
		'status.overtime': 'Overtime!',
		'status.pending': 'Pending',
		'total.time': 'Total Time:',
		'total.estimated': 'estimated',
		'total.actual': 'actual',
		'history.title': 'Meeting History',
		'history.items': 'items',
		'history.total': 'Total:',
		'button.load': 'Load',
		'retrospective.timeAnalysis': 'Time Analysis',
		'retrospective.totalEstimated': 'Total Estimated',
		'retrospective.totalActual': 'Total Actual',
		'retrospective.overallDifference': 'Overall Difference',
		'nav.home': 'Home',
		'nav.toggleLanguage': 'Toggle Language',
		'nav.toggleTheme': 'Toggle Theme'
	},
	ja: {
		'meeting.title': '会議時間トラッカー',
		'meeting.retrospective': '会議振り返り',
		'meeting.backToTracker': 'トラッカーに戻る',
		'agenda.add': 'アジェンダ項目を追加',
		'agenda.topicName': 'トピック名',
		'agenda.topicNamePlaceholder': 'トピック名を入力',
		'agenda.estimatedTime': '予定時間（分）',
		'agenda.estimatedTimePlaceholder': '5',
		'button.add': '追加',
		'meeting.progress': '会議進行状況',
		'button.startMeeting': '会議開始',
		'button.pause': '一時停止',
		'button.reset': 'リセット',
		'button.saveMeeting': '会議保存',
		'button.retrospective': '振り返り',
		'table.topicName': 'トピック名',
		'table.estimated': '予定',
		'table.actual': '実際',
		'table.status': 'ステータス',
		'table.action': 'アクション',
		'table.difference': '差分',
		'table.accuracy': '精度',
		'button.complete': '完了',
		'status.complete': '完了',
		'status.inProgress': '進行中',
		'status.overtime': '時間超過！',
		'status.pending': '待機中',
		'total.time': '合計時間:',
		'total.estimated': '予定',
		'total.actual': '実際',
		'history.title': '会議履歴',
		'history.items': '項目',
		'history.total': '合計:',
		'button.load': '読み込み',
		'retrospective.timeAnalysis': '時間分析',
		'retrospective.totalEstimated': '合計予定時間',
		'retrospective.totalActual': '合計実際時間',
		'retrospective.overallDifference': '全体差分',
		'nav.home': 'ホーム',
		'nav.toggleLanguage': '言語切替',
		'nav.toggleTheme': 'テーマ切替'
	}
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<Language>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('language')
			if (saved === 'en' || saved === 'ja') {
				return saved
			}
			return navigator.language.startsWith('ja') ? 'ja' : 'en'
		}
		return 'en'
	})

	const setLanguage = (newLanguage: Language) => {
		setLanguageState(newLanguage)
		if (typeof window !== 'undefined') {
			localStorage.setItem('language', newLanguage)
		}
	}

	const t = (key: string): string => {
		return translations[language][key] || key
	}

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	)
}

export function useLanguage() {
	const context = useContext(LanguageContext)
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}
	return context
}