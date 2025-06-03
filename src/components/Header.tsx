import { Link } from '@tanstack/react-router'
import { Moon, Sun, Languages } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Header() {
	const { theme, toggleTheme } = useTheme()
	const { language, setLanguage, t } = useLanguage()

	return (
		<header className="p-2 flex gap-2 bg-background text-foreground border-b border-border justify-between">
			<nav className="flex flex-row">
				<div className="px-2 font-bold">
					<Link to="/">{t('nav.home')}</Link>
				</div>
			</nav>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
					className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
					title={t('nav.toggleLanguage')}
				>
					<Languages size={18} />
					<span className="ml-1 text-sm">{language === 'en' ? 'EN' : 'JP'}</span>
				</button>

				<button
					type="button"
					onClick={toggleTheme}
					className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
					title={t('nav.toggleTheme')}
				>
					{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
				</button>
			</div>
		</header>
	)
}
