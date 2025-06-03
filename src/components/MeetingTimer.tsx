import { Clock } from 'lucide-react'

interface MeetingTimerProps {
	totalElapsed: number
	isRunning: boolean
}

export function MeetingTimer({ totalElapsed, isRunning }: MeetingTimerProps) {
	const hours = Math.floor(totalElapsed / 3600000)
	const minutes = Math.floor((totalElapsed % 3600000) / 60000)
	const seconds = Math.floor((totalElapsed % 60000) / 1000)

	return (
		<div className="relative">
			{/* Background glow effect when running */}
			{isRunning && (
				<div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl animate-pulse" />
			)}
			
			<div className="relative bg-card border border-border rounded-2xl p-8 text-center">
				<Clock className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
				
				{/* Large timer display */}
				<div className="flex items-center justify-center gap-2 text-6xl font-mono font-bold">
					<span className="text-primary tabular-nums">
						{hours.toString().padStart(2, '0')}
					</span>
					<span className="text-muted-foreground animate-pulse">:</span>
					<span className="text-primary tabular-nums">
						{minutes.toString().padStart(2, '0')}
					</span>
					<span className="text-muted-foreground animate-pulse">:</span>
					<span className="text-primary tabular-nums">
						{seconds.toString().padStart(2, '0')}
					</span>
				</div>
				
				{/* Visual running indicator */}
				{isRunning && (
					<div className="mt-4 flex items-center justify-center gap-1">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300" />
					</div>
				)}
			</div>
		</div>
	)
}