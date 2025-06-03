import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, History, BarChart3, Timer, ListChecks } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { MeetingTimer } from '../components/MeetingTimer'
import { MeetingProgress } from '../components/MeetingProgress'

export const Route = createFileRoute('/tracker')({
	component: MeetingTimeTracker,
})

interface AgendaItem {
	id: string
	name: string
	estimatedMinutes: number
	actualMinutes?: number
	isActive: boolean
	startTime?: number
	elapsedTime: number
}

interface Meeting {
	id: string
	date: string
	agendaItems: AgendaItem[]
}

/**
 * Main meeting time tracking application component.
 * 
 * Orchestrates the entire meeting tracking workflow including agenda management,
 * time tracking, meeting controls, and progress visualization. Manages meeting state,
 * timer operations, and persistence of meeting history to localStorage.
 */
function MeetingTimeTracker() {
	const { t } = useLanguage()
	const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
	const [isRunning, setIsRunning] = useState(false)
	const [currentTime, setCurrentTime] = useState(Date.now())
	const [meetingHistory, setMeetingHistory] = useState<Meeting[]>([])

	useEffect(() => {
		const saved = localStorage.getItem('meeting-history')
		if (saved) {
			setMeetingHistory(JSON.parse(saved))
		}
	}, [])

	useEffect(() => {
		let interval: number | undefined
		if (isRunning) {
			interval = window.setInterval(() => {
				setCurrentTime(Date.now())
			}, 1000)
		}
		return () => {
			if (interval) clearInterval(interval)
		}
	}, [isRunning])


	/**
	 * Updates an existing agenda item with new name and estimated time.
	 * Modifies the agenda item at the specified index without affecting other items.
	 * 
	 * @param index - Zero-based index of the item to update
	 * @param name - New name for the agenda item
	 * @param estimatedMinutes - New estimated duration in minutes
	 */
	const editAgendaItem = (index: number, name: string, estimatedMinutes: number) => {
		setAgendaItems(items => 
			items.map((item, i) => 
				i === index ? { ...item, name, estimatedMinutes } : item
			)
		)
	}

	/**
	 * Removes an agenda item from the list.
	 * Permanently deletes the item at the specified index.
	 * 
	 * @param index - Zero-based index of the item to remove
	 */
	const deleteAgendaItem = (index: number) => {
		setAgendaItems(items => items.filter((_, i) => i !== index))
	}

	/**
	 * Initiates the meeting timer and activates the first incomplete agenda item.
	 * Sets the meeting state to running and begins tracking time for the first item
	 * that hasn't been completed yet. Only starts if there are agenda items and
	 * the meeting is not already running.
	 */
	const startMeeting = () => {
		if (agendaItems.length > 0 && !isRunning) {
			setIsRunning(true)
			const firstIncompleteIndex = agendaItems.findIndex(item => !item.actualMinutes)
			if (firstIncompleteIndex !== -1) {
				setAgendaItems(items =>
					items.map((item, index) => ({
						...item,
						isActive: index === firstIncompleteIndex,
						startTime: index === firstIncompleteIndex ? Date.now() : item.startTime,
					}))
				)
			}
		}
	}

	/**
	 * Pauses the meeting timer and saves elapsed time for the active item.
	 * Stops the global timer and accumulates elapsed time for any currently
	 * active agenda item, preserving progress without completing the item.
	 */
	const pauseMeeting = () => {
		setIsRunning(false)
		setAgendaItems(items =>
			items.map(item => {
				if (item.isActive && item.startTime) {
					return {
						...item,
						elapsedTime: item.elapsedTime + (Date.now() - item.startTime),
						startTime: undefined,
					}
				}
				return { ...item, isActive: false }
			})
		)
	}

	/**
	 * Marks the currently active agenda item as complete and advances to the next item.
	 * Calculates the total elapsed time for the active item, saves it as actualMinutes,
	 * and automatically activates the next incomplete item if the meeting is still running.
	 */
	const completeCurrentItem = () => {
		const activeIndex = agendaItems.findIndex(item => item.isActive)
		if (activeIndex !== -1) {
			setAgendaItems(items =>
				items.map((item, index) => {
					if (index === activeIndex) {
						const totalElapsed = item.startTime
							? item.elapsedTime + (Date.now() - item.startTime)
							: item.elapsedTime
						return {
							...item,
							isActive: false,
							actualMinutes: Math.round(totalElapsed / 60000 * 10) / 10,
							startTime: undefined,
						}
					}
					if (index === activeIndex + 1 && isRunning) {
						return {
							...item,
							isActive: true,
							startTime: Date.now(),
						}
					}
					return item
				})
			)
		}
	}

	/**
	 * Resets the entire meeting to its initial state.
	 * Stops the timer and clears all progress data including actual times,
	 * active states, and elapsed time for all agenda items.
	 */
	const resetMeeting = () => {
		setIsRunning(false)
		setAgendaItems(items =>
			items.map(item => ({
				...item,
				isActive: false,
				actualMinutes: undefined,
				startTime: undefined,
				elapsedTime: 0,
			}))
		)
	}

	/**
	 * Saves the completed meeting to localStorage history.
	 * Creates a meeting record with completed items only and adds it to the
	 * history list (max 10 entries). Only saves if there are completed items.
	 */
	const saveMeeting = () => {
		if (agendaItems.length > 0 && agendaItems.some(item => item.actualMinutes)) {
			const meeting: Meeting = {
				id: Date.now().toString(),
				date: new Date().toISOString(),
				agendaItems: agendaItems.filter(item => item.actualMinutes),
			}
			const updatedHistory = [meeting, ...meetingHistory].slice(0, 10)
			setMeetingHistory(updatedHistory)
			localStorage.setItem('meeting-history', JSON.stringify(updatedHistory))
		}
	}

	/**
	 * Loads a previously saved meeting from history.
	 * Replaces current agenda items with the saved meeting's items,
	 * resetting all timing data to prepare for a new session.
	 * 
	 * @param meeting - The meeting object to load from history
	 */
	const loadMeeting = (meeting: Meeting) => {
		setAgendaItems(meeting.agendaItems.map(item => ({
			...item,
			isActive: false,
			startTime: undefined,
			elapsedTime: 0,
		})))
		setIsRunning(false)
	}

	/**
	 * Calculates the current elapsed time for an agenda item.
	 * For active items with a start time, includes real-time progress.
	 * For inactive items, returns the accumulated elapsed time.
	 * 
	 * @param item - The agenda item to calculate elapsed time for
	 * @returns Elapsed time in milliseconds
	 */
	const getCurrentElapsed = (item: AgendaItem): number => {
		if (item.isActive && item.startTime) {
			return item.elapsedTime + (currentTime - item.startTime)
		}
		return item.elapsedTime
	}

	/**
	 * Formats time duration into MM:SS string format.
	 * Converts decimal minutes into a readable time display with
	 * zero-padded seconds for consistent formatting.
	 * 
	 * @param minutes - Time duration in decimal minutes
	 * @returns Formatted time string in MM:SS format
	 */
	const formatTime = (minutes: number): string => {
		const mins = Math.floor(minutes)
		const secs = Math.floor((minutes - mins) * 60)
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const totalEstimated = agendaItems.reduce((sum, item) => sum + item.estimatedMinutes, 0)
	const totalActual = agendaItems.reduce((sum, item) => sum + (item.actualMinutes || 0), 0)
	const completedItems = agendaItems.filter(item => item.actualMinutes)
	const allItemsComplete = agendaItems.length > 0 && agendaItems.every(item => item.actualMinutes)

	/**
	 * Populates the agenda with sample data for demonstration purposes.
	 * Creates three predefined agenda items with localized names and
	 * typical meeting durations to help users understand the application.
	 * Used during onboarding and empty state scenarios.
	 */
	const handleAddSampleData = () => {
		const sampleItems: AgendaItem[] = [
			{ id: '1', name: t('onboarding.step1'), estimatedMinutes: 5, isActive: false, elapsedTime: 0 },
			{ id: '2', name: t('onboarding.step2'), estimatedMinutes: 10, isActive: false, elapsedTime: 0 },
			{ id: '3', name: t('onboarding.step3'), estimatedMinutes: 5, isActive: false, elapsedTime: 0 }
		]
		setAgendaItems(sampleItems)
	}

	const totalElapsed = agendaItems.reduce((sum, item) => {
		if (item.actualMinutes) return sum + item.actualMinutes * 60000
		return sum + getCurrentElapsed(item)
	}, 0)

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-6xl mx-auto">
				{/* Visual header with icons */}
				<div className="flex items-center justify-center gap-3 mb-8">
					<Timer className="w-8 h-8 text-primary" />
					<h1 className="text-3xl font-bold text-foreground">
						{t('meeting.title')}
					</h1>
					<ListChecks className="w-8 h-8 text-primary" />
				</div>


				{/* Unified agenda items list */}
				<div className="bg-card rounded-lg shadow-lg p-6 mb-6 border border-border">
					<h2 className="text-xl font-semibold mb-6 text-card-foreground flex items-center gap-2">
						<ListChecks className="w-5 h-5 text-primary" />
						{t('agenda.itemsList')}
					</h2>
					<MeetingProgress 
						items={agendaItems} 
						onItemClick={(index) => {
							if (agendaItems[index].isActive) {
								completeCurrentItem()
							}
						}}
						onItemEdit={editAgendaItem}
						onItemDelete={deleteAgendaItem}
						onItemAdd={(name, estimatedMinutes) => {
							const newItem: AgendaItem = {
								id: Date.now().toString(),
								name,
								estimatedMinutes,
								isActive: false,
								elapsedTime: 0,
							}
							setAgendaItems([...agendaItems, newItem])
						}}
						onAddSample={handleAddSampleData}
					/>
				</div>

				{agendaItems.length > 0 && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						{/* Timer display */}
						<div>
							<MeetingTimer totalElapsed={totalElapsed} isRunning={isRunning} />
							
							{/* Control buttons below timer */}
							<div className="flex gap-2 flex-wrap justify-center mt-4">
								{!isRunning ? (
									<button
										type="button"
										onClick={startMeeting}
										className="px-4 py-2 bg-green-600 dark:bg-green-600 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-700 transition-colors flex items-center gap-2"
									>
										<Play size={16} />
										{t('button.startMeeting')}
									</button>
								) : (
									<button
										type="button"
										onClick={pauseMeeting}
										className="px-4 py-2 bg-yellow-600 dark:bg-yellow-600 text-white rounded-md hover:bg-yellow-700 dark:hover:bg-yellow-700 transition-colors flex items-center gap-2"
									>
										<Pause size={16} />
										{t('button.pause')}
									</button>
								)}
								<button
									type="button"
									onClick={resetMeeting}
									className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center gap-2"
								>
									<RotateCcw size={16} />
									{t('button.reset')}
								</button>
								{allItemsComplete && (
									<button
										type="button"
										onClick={saveMeeting}
										className="px-4 py-2 bg-purple-600 dark:bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-700 transition-colors flex items-center gap-2"
									>
										<History size={16} />
										{t('button.saveMeeting')}
									</button>
								)}
							</div>
						</div>

						{/* Progress summary card */}
						<div className="bg-card rounded-lg shadow-lg p-6 border border-border">
							<h2 className="text-xl font-semibold mb-6 text-card-foreground flex items-center gap-2">
								<BarChart3 className="w-5 h-5 text-primary" />
								{t('meeting.progress')}
							</h2>
							<div className="space-y-4">
								<div className="relative">
									<div className="h-4 bg-muted rounded-full overflow-hidden">
										<div 
											className="h-full bg-primary transition-all duration-500 ease-out"
											style={{ width: `${Math.min((totalActual / totalEstimated) * 100, 100) || 0}%` }}
										/>
									</div>
									<div className="mt-2 text-center text-sm text-muted-foreground">
										{Math.round((totalActual / totalEstimated) * 100) || 0}% {t('meeting.complete')}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="text-center">
										<div className="font-semibold text-lg">{formatTime(totalEstimated)}</div>
										<div className="text-muted-foreground">{t('total.estimated')}</div>
									</div>
									<div className="text-center">
										<div className="font-semibold text-lg">{formatTime(totalActual)}</div>
										<div className="text-muted-foreground">{t('total.actual')}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Detailed table view - now optional */}
				{agendaItems.length > 0 && (
					<details className="bg-card rounded-lg shadow-lg p-6 mb-6 border border-border">
						<summary className="cursor-pointer font-semibold text-card-foreground hover:text-primary transition-colors">
							{t('table.topicName')} - {t('table.details' || 'Detailed View')}
						</summary>
						<div className="mt-4 overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-muted">
										<th className="text-left py-2 px-4 border-b border-border">{t('table.topicName')}</th>
										<th className="text-center py-2 px-4 border-b border-border">{t('table.estimated')}</th>
										<th className="text-center py-2 px-4 border-b border-border">{t('table.actual')}</th>
										<th className="text-center py-2 px-4 border-b border-border">{t('table.status')}</th>
										<th className="text-center py-2 px-4 border-b border-border">{t('table.action')}</th>
									</tr>
								</thead>
								<tbody>
									{agendaItems.map((item) => {
										const currentElapsed = getCurrentElapsed(item) / 60000
										const isOvertime = currentElapsed > item.estimatedMinutes
										
										return (
											<tr
												key={item.id}
												className={`${
													item.isActive ? 'bg-primary/10' : ''
												} ${isOvertime && item.isActive ? 'bg-destructive/10' : ''}`}
											>
												<td className="py-3 px-4 border-b border-border">{item.name}</td>
												<td className="text-center py-3 px-4 border-b border-border">
													{formatTime(item.estimatedMinutes)}
												</td>
												<td className={`text-center py-3 px-4 border-b border-border ${
													isOvertime && item.isActive ? 'text-destructive font-semibold' : ''
												}`}>
													{item.actualMinutes 
														? formatTime(item.actualMinutes)
														: item.isActive 
															? formatTime(currentElapsed)
															: '-'
													}
												</td>
												<td className="text-center py-3 px-4 border-b border-border">
													{item.actualMinutes ? (
														<span className="text-green-600 dark:text-green-500 font-semibold">{t('status.complete')}</span>
													) : item.isActive ? (
														<span className={`font-semibold ${
															isOvertime ? 'text-destructive' : 'text-primary'
														}`}>
															{isOvertime ? t('status.overtime') : t('status.inProgress')}
														</span>
													) : (
														<span className="text-muted-foreground">{t('status.pending')}</span>
													)}
												</td>
												<td className="text-center py-3 px-4 border-b border-border">
													{item.isActive && (
														<button
															type="button"
															onClick={completeCurrentItem}
															className="px-3 py-1 bg-green-600 dark:bg-green-600 text-white rounded text-sm hover:bg-green-700 dark:hover:bg-green-700 transition-colors"
														>
															{t('button.complete')}
														</button>
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						<div className="mt-4 p-4 bg-muted rounded-lg">
							<div className="flex justify-between items-center text-lg font-semibold">
								<span>{t('total.time')}</span>
								<span>
									{formatTime(totalEstimated)} {t('total.estimated')} / {formatTime(totalActual)} {t('total.actual')}
								</span>
							</div>
						</div>
					</details>
				)}

				{meetingHistory.length > 0 && (
					<div className="bg-card rounded-lg shadow-lg p-6 border border-border">
						<h2 className="text-xl font-semibold mb-4 text-card-foreground">{t('history.title')}</h2>
						<div className="space-y-3">
							{meetingHistory.map((meeting) => (
								<div key={meeting.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
									<div>
										<p className="font-medium">
											{new Date(meeting.date).toLocaleDateString()} - {meeting.agendaItems.length} {t('history.items')}
										</p>
										<p className="text-sm text-muted-foreground">
											{t('history.total')} {formatTime(meeting.agendaItems.reduce((sum, item) => sum + (item.actualMinutes || 0), 0))}
										</p>
									</div>
									<button
										type="button"
										onClick={() => loadMeeting(meeting)}
										className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
									>
										{t('button.load')}
									</button>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}