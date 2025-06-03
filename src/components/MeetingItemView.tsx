import React from 'react';
import type { AgendaItem } from '../lib/schemas';
import TimerDisplay from './TimerDisplay';

interface MeetingItemViewProps {
  item: AgendaItem;
  isActive: boolean;
  remainingSeconds: number | null;
}

const MeetingItemView: React.FC<MeetingItemViewProps> = ({
  item,
  isActive,
  remainingSeconds,
}) => {
  const baseClasses = 'p-2 border-b';
  const activeClasses = isActive ? 'bg-blue-100' : '';

  return (
    <div className={`${baseClasses} ${activeClasses}`}>
      <h3 className="font-semibold">{item.name}</h3>
      <p>Planned Time: {item.plannedTime} min</p>

      {isActive && remainingSeconds !== null ? (
        <TimerDisplay seconds={remainingSeconds} />
      ) : (
        // Display actual time if available and item is not active,
        // or a placeholder if timer is not active for this item yet.
        item.actualTime !== undefined ?
        <div className="my-1 text-sm">Actual: {item.actualTime} min</div>
        : <div className="my-1 p-1 text-gray-500 text-sm">Timer not active</div>
      )}

      {item.actualTime !== undefined && (
        <div className="mt-1 text-sm">
          <p>Actual Time: {item.actualTime} min</p>
          <p
            className={
              item.actualTime - item.plannedTime > 0
                ? 'text-red-500 font-medium'
                : 'text-green-500 font-medium'
            }
          >
            Discrepancy: {item.actualTime - item.plannedTime > 0 ? '+' : ''}
            {item.actualTime - item.plannedTime} min
          </p>
        </div>
      )}
      {!isActive && item.actualTime === undefined && (
         <div className="text-sm text-gray-400 mt-1">Actual Time: (Pending)</div>
      )}
    </div>
  );
};

export default MeetingItemView;
