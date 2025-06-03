import { CheckCircle2, Circle, Play } from 'lucide-react'

interface AgendaItem {
	id: string
	name: string
	estimatedMinutes: number
	actualMinutes?: number
	isActive: boolean
}

interface MeetingProgressProps {
	items: AgendaItem[]
	onItemClick?: (index: number) => void
}

export function MeetingProgress({ items, onItemClick }: MeetingProgressProps) {
	const totalEstimated = items.reduce((sum, item) => sum + item.estimatedMinutes, 0)
	const totalCompleted = items.reduce((sum, item) => sum + (item.actualMinutes || 0), 0)
	const progressPercentage = totalEstimated > 0 ? (totalCompleted / totalEstimated) * 100 : 0

	return (
		<div className="space-y-6">
			{/* Overall progress bar */}
			<div className="relative">
				<div className="h-4 bg-muted rounded-full overflow-hidden">
					<div 
						className="h-full bg-primary transition-all duration-500 ease-out relative"
						style={{ width: `${Math.min(progressPercentage, 100)}%` }}
					>
						{/* Animated shimmer effect */}
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
					</div>
				</div>
				{progressPercentage > 0 && (
					<div className="absolute top-1/2 -translate-y-1/2 text-xs font-medium text-primary-foreground"
						style={{ left: `${Math.min(progressPercentage, 95)}%` }}>
						{Math.round(progressPercentage)}%
					</div>
				)}
			</div>

			{/* Visual timeline */}
			<div className="relative">
				{items.map((item, index) => {
					const isCompleted = !!item.actualMinutes
					const isLast = index === items.length - 1
					
					return (
						<div key={item.id} className="flex items-start gap-4 group">
							{/* Timeline connector */}
							<div className="relative flex flex-col items-center">
								<button
									type="button"
									onClick={() => onItemClick?.(index)}
									className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
										${isCompleted 
											? 'bg-green-500 text-white' 
											: item.isActive 
												? 'bg-primary text-primary-foreground animate-pulse' 
												: 'bg-muted hover:bg-muted-foreground/20'
										}`}
								>
									{isCompleted ? (
										<CheckCircle2 className="w-5 h-5" />
									) : item.isActive ? (
										<Play className="w-4 h-4" />
									) : (
										<Circle className="w-5 h-5" />
									)}
								</button>
								{!isLast && (
									<div className={`w-0.5 h-16 -mt-1 transition-colors
										${isCompleted ? 'bg-green-500' : 'bg-border'}`} />
								)}
							</div>

							{/* Item details */}
							<div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
								<h4 className={`font-medium transition-colors
									${item.isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
									{item.name}
								</h4>
								<div className="flex items-center gap-4 mt-1">
									<span className="text-sm text-muted-foreground">
										{item.estimatedMinutes} min
									</span>
									{item.actualMinutes && (
										<span className={`text-sm font-medium
											${item.actualMinutes > item.estimatedMinutes ? 'text-destructive' : 'text-green-600 dark:text-green-500'}`}>
											{item.actualMinutes > item.estimatedMinutes ? '+' : '-'}
											{Math.abs(item.actualMinutes - item.estimatedMinutes)} min
										</span>
									)}
								</div>
								
								{/* Item progress bar */}
								{item.isActive && (
									<div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
										<div className="h-full bg-primary animate-progress" />
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>
			{/* Total time summary */}
			<div className="mt-6 p-4 bg-muted rounded-lg">
				<div className="flex justify-between items-center">
					<span className="font-medium">Total Time:</span>
					<div className="flex gap-4 text-sm">
						<span className="text-muted-foreground">
							Estimated: {totalEstimated} min
						</span>
						<span className="text-muted-foreground">
							Actual: {Math.round(totalCompleted * 10) / 10} min
						</span>
						{totalCompleted > 0 && (
							<span className={`font-medium ${
								totalCompleted > totalEstimated ? 'text-destructive' : 'text-green-600 dark:text-green-500'
							}`}>
								{totalCompleted > totalEstimated ? '+' : '-'}
								{Math.abs(Math.round((totalCompleted - totalEstimated) * 10) / 10)} min
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}