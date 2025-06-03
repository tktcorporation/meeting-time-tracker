import React from 'react';
import type { AgendaItem } from '../lib/schemas';
import MeetingItemView from './MeetingItemView';

interface MeetingViewListProps {
  items: AgendaItem[];
  currentItemId: string | null;
  timerRemainingSeconds: number | null; // For the currently active item
  // isCurrentItemOvertime is derived from timerRemainingSeconds in AgendaInputList/TimerDisplay
}

const MeetingViewList: React.FC<MeetingViewListProps> = ({
  items,
  currentItemId,
  timerRemainingSeconds,
}) => {
  return (
    <div className="border rounded">
      {items.map(item => (
        <MeetingItemView
          key={item.id}
          item={item}
          isActive={item.id === currentItemId}
          remainingSeconds={item.id === currentItemId ? timerRemainingSeconds : null}
          // isOvertime is handled by TimerDisplay based on remainingSeconds
        />
      ))}
    </div>
  );
};

export default MeetingViewList;
