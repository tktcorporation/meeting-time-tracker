import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Play, Pause, RotateCcw, History, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/')({
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

function MeetingTimeTracker() {
	const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
	const [newItemName, setNewItemName] = useState('')
	const [newItemTime, setNewItemTime] = useState('')
	const [isRunning, setIsRunning] = useState(false)
	const [currentTime, setCurrentTime] = useState(Date.now())
	const [showRetrospective, setShowRetrospective] = useState(false)
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

	const addAgendaItem = () => {
		if (newItemName.trim() && newItemTime) {
			const newItem: AgendaItem = {
				id: Date.now().toString(),
				name: newItemName.trim(),
				estimatedMinutes: Number.parseInt(newItemTime),
				isActive: false,
				elapsedTime: 0,
			}
			setAgendaItems([...agendaItems, newItem])
			setNewItemName('')
			setNewItemTime('')
		}
	}

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

	const loadMeeting = (meeting: Meeting) => {
		setAgendaItems(meeting.agendaItems.map(item => ({
			...item,
			isActive: false,
			startTime: undefined,
			elapsedTime: 0,
		})))
		setIsRunning(false)
	}

	const getCurrentElapsed = (item: AgendaItem): number => {
		if (item.isActive && item.startTime) {
			return item.elapsedTime + (currentTime - item.startTime)
		}
		return item.elapsedTime
	}

	const formatTime = (minutes: number): string => {
		const mins = Math.floor(minutes)
		const secs = Math.floor((minutes - mins) * 60)
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const totalEstimated = agendaItems.reduce((sum, item) => sum + item.estimatedMinutes, 0)
	const totalActual = agendaItems.reduce((sum, item) => sum + (item.actualMinutes || 0), 0)

	const getTimeDifference = (estimated: number, actual: number): string => {
		const diff = actual - estimated
		const sign = diff >= 0 ? '+' : ''
		return `${sign}${formatTime(Math.abs(diff))}`
	}

	const completedItems = agendaItems.filter(item => item.actualMinutes)
	const allItemsComplete = agendaItems.length > 0 && agendaItems.every(item => item.actualMinutes)

	if (showRetrospective && completedItems.length > 0) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900">Meeting Retrospective</h1>
						<button
							type="button"
							onClick={() => setShowRetrospective(false)}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Back to Tracker
						</button>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<h2 className="text-xl font-semibold mb-4">Time Analysis</h2>
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-gray-50">
										<th className="text-left py-2 px-4 border-b">Topic</th>
										<th className="text-center py-2 px-4 border-b">Estimated</th>
										<th className="text-center py-2 px-4 border-b">Actual</th>
										<th className="text-center py-2 px-4 border-b">Difference</th>
										<th className="text-center py-2 px-4 border-b">Accuracy</th>
									</tr>
								</thead>
								<tbody>
									{completedItems.map((item) => {
										const difference = (item.actualMinutes ?? 0) - item.estimatedMinutes
										const accuracy = Math.round((1 - Math.abs(difference) / item.estimatedMinutes) * 100)
										
										return (
											<tr key={item.id}>
												<td className="py-3 px-4 border-b">{item.name}</td>
												<td className="text-center py-3 px-4 border-b">
													{formatTime(item.estimatedMinutes)}
												</td>
												<td className="text-center py-3 px-4 border-b">
													{formatTime(item.actualMinutes ?? 0)}
												</td>
												<td className={`text-center py-3 px-4 border-b font-semibold ${
													difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'
												}`}>
													{getTimeDifference(item.estimatedMinutes, item.actualMinutes ?? 0)}
												</td>
												<td className={`text-center py-3 px-4 border-b font-semibold ${
													accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
												}`}>
													{accuracy}%
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<h3 className="font-semibold text-blue-800">Total Estimated</h3>
								<p className="text-2xl font-bold text-blue-600">{formatTime(totalEstimated)}</p>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<h3 className="font-semibold text-green-800">Total Actual</h3>
								<p className="text-2xl font-bold text-green-600">{formatTime(totalActual)}</p>
							</div>
							<div className={`p-4 rounded-lg ${
								totalActual > totalEstimated ? 'bg-red-50' : 'bg-green-50'
							}`}>
								<h3 className={`font-semibold ${
									totalActual > totalEstimated ? 'text-red-800' : 'text-green-800'
								}`}>
									Overall Difference
								</h3>
								<p className={`text-2xl font-bold ${
									totalActual > totalEstimated ? 'text-red-600' : 'text-green-600'
								}`}>
									{getTimeDifference(totalEstimated, totalActual)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
					Meeting Time Tracker
				</h1>

				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Add Agenda Item</h2>
					<div className="flex gap-4 items-end">
						<div className="flex-1">
							<label htmlFor="topic-name" className="block text-sm font-medium text-gray-700 mb-1">
								Topic Name
							</label>
							<input
								id="topic-name"
								type="text"
								value={newItemName}
								onChange={(e) => setNewItemName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter topic name"
							/>
						</div>
						<div>
							<label htmlFor="estimated-time" className="block text-sm font-medium text-gray-700 mb-1">
								Estimated Time (minutes)
							</label>
							<input
								id="estimated-time"
								type="number"
								value={newItemTime}
								onChange={(e) => setNewItemTime(e.target.value)}
								className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="5"
								min="1"
							/>
						</div>
						<button
							type="button"
							onClick={addAgendaItem}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
						>
							<Plus size={16} />
							Add
						</button>
					</div>
				</div>

				{agendaItems.length > 0 && (
					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">Meeting Progress</h2>
							<div className="flex gap-2 flex-wrap">
								{!isRunning ? (
									<button
										type="button"
										onClick={startMeeting}
										className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
									>
										<Play size={16} />
										Start Meeting
									</button>
								) : (
									<button
										type="button"
										onClick={pauseMeeting}
										className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
									>
										<Pause size={16} />
										Pause
									</button>
								)}
								<button
									type="button"
									onClick={resetMeeting}
									className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
								>
									<RotateCcw size={16} />
									Reset
								</button>
								{allItemsComplete && (
									<button
										type="button"
										onClick={saveMeeting}
										className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
									>
										<History size={16} />
										Save Meeting
									</button>
								)}
								{completedItems.length > 0 && (
									<button
										type="button"
										onClick={() => setShowRetrospective(true)}
										className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
									>
										<BarChart3 size={16} />
										Retrospective
									</button>
								)}
							</div>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-gray-50">
										<th className="text-left py-2 px-4 border-b">Topic Name</th>
										<th className="text-center py-2 px-4 border-b">Estimated</th>
										<th className="text-center py-2 px-4 border-b">Actual</th>
										<th className="text-center py-2 px-4 border-b">Status</th>
										<th className="text-center py-2 px-4 border-b">Action</th>
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
													item.isActive ? 'bg-blue-50' : ''
												} ${isOvertime && item.isActive ? 'bg-red-50' : ''}`}
											>
												<td className="py-3 px-4 border-b">{item.name}</td>
												<td className="text-center py-3 px-4 border-b">
													{formatTime(item.estimatedMinutes)}
												</td>
												<td className={`text-center py-3 px-4 border-b ${
													isOvertime && item.isActive ? 'text-red-600 font-semibold' : ''
												}`}>
													{item.actualMinutes 
														? formatTime(item.actualMinutes)
														: item.isActive 
															? formatTime(currentElapsed)
															: '-'
													}
												</td>
												<td className="text-center py-3 px-4 border-b">
													{item.actualMinutes ? (
														<span className="text-green-600 font-semibold">Complete</span>
													) : item.isActive ? (
														<span className={`font-semibold ${
															isOvertime ? 'text-red-600' : 'text-blue-600'
														}`}>
															{isOvertime ? 'Overtime!' : 'In Progress'}
														</span>
													) : (
														<span className="text-gray-500">Pending</span>
													)}
												</td>
												<td className="text-center py-3 px-4 border-b">
													{item.isActive && (
														<button
															type="button"
															onClick={completeCurrentItem}
															className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
														>
															Complete
														</button>
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						<div className="mt-4 p-4 bg-gray-50 rounded-lg">
							<div className="flex justify-between items-center text-lg font-semibold">
								<span>Total Time:</span>
								<span>
									{formatTime(totalEstimated)} estimated / {formatTime(totalActual)} actual
								</span>
							</div>
						</div>
					</div>
				)}

				{meetingHistory.length > 0 && (
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4">Meeting History</h2>
						<div className="space-y-3">
							{meetingHistory.map((meeting) => (
								<div key={meeting.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
									<div>
										<p className="font-medium">
											{new Date(meeting.date).toLocaleDateString()} - {meeting.agendaItems.length} items
										</p>
										<p className="text-sm text-gray-600">
											Total: {formatTime(meeting.agendaItems.reduce((sum, item) => sum + (item.actualMinutes || 0), 0))}
										</p>
									</div>
									<button
										type="button"
										onClick={() => loadMeeting(meeting)}
										className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
									>
										Load
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