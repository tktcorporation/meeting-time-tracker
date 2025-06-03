import React, { useState, useEffect } from 'react';
import type { AgendaItem } from '../lib/schemas';
import { loadAgendaItems, saveAgendaItems } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import AgendaItemRow from './AgendaItemRow';
import MeetingViewList from './MeetingViewList';
import ReflectionView from './ReflectionView'; // Import ReflectionView

const AgendaInputList: React.FC = () => {
  const [items, setItems] = useState<AgendaItem[]>(loadAgendaItems());
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number | null>(null);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentItemStartTime, setCurrentItemStartTime] = useState<number | null>(null);
  const [meetingJustEnded, setMeetingJustEnded] = useState(
    // Check if any item has actualTime on initial load
    loadAgendaItems().some(item => item.actualTime !== undefined)
  );
  const [isReflectionModeActive, setIsReflectionModeActive] = useState(false);


  // Persist items to localStorage
  useEffect(() => {
    saveAgendaItems(items);
  }, [items]);

  // Timer lifecycle and current item start time management
  useEffect(() => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }

    if (isMeetingActive && currentItemId) {
      const activeItem = items.find(i => i.id === currentItemId);
      if (activeItem) {
        setTimerRemainingSeconds(activeItem.plannedTime * 60);
        setCurrentItemStartTime(Date.now()); // Set start time for the new active item
        const newIntervalId = setInterval(() => {
          setTimerRemainingSeconds(prev => (prev !== null ? prev - 1 : 0));
        }, 1000);
        setTimerIntervalId(newIntervalId);
      }
    } else {
      setTimerRemainingSeconds(null);
    }

    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItemId, isMeetingActive]);

  const recordActualTime = (itemId: string) => {
    if (!currentItemStartTime || !itemId) return;
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - currentItemStartTime) / 1000);
    const durationMinutes = Math.ceil(durationSeconds / 60);

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, actualTime: durationMinutes } : item,
      ),
    );
    setCurrentItemStartTime(null);
  };

  const handleAddItem = () => {
    const newItem: AgendaItem = {
      id: uuidv4(),
      name: 'New Topic',
      plannedTime: 10,
    };
    setItems([...items, newItem]);
    setMeetingJustEnded(false); // Reset summary visibility if new items are added
    setIsReflectionModeActive(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    // meetingJustEnded state remains, summary might still be relevant
  };

  const handleNameChange = (id: string, name: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, name } : item)));
  };

  const handleTimeChange = (id: string, time: number) => {
    const newTime = time > 0 ? time : 1;
    setItems(
      items.map(item => (item.id === id ? { ...item, plannedTime: newTime } : item)),
    );
  };

  const calculateTotalPlannedTime = () => {
    return items.reduce((total, item) => total + item.plannedTime, 0);
  };

  const calculateTotalActualTime = () => {
    return items.reduce((total, item) => total + (item.actualTime || 0), 0);
  };

  const handleStartMeeting = () => {
    if (items.length > 0) {
      setItems(prevItems => prevItems.map(item => ({ ...item, actualTime: undefined })));
      setIsMeetingActive(true);
      setCurrentItemId(items[0]?.id || null);
      setMeetingJustEnded(false);
      setIsReflectionModeActive(false);
    }
  };

  const handleEndMeeting = () => {
    if (currentItemId) {
      recordActualTime(currentItemId);
    }
    setIsMeetingActive(false);
    setCurrentItemId(null);
    if (timerIntervalId) clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setTimerRemainingSeconds(null);
    setCurrentItemStartTime(null);
    setMeetingJustEnded(true);
  };

  const handleNextItem = () => {
    if (!currentItemId) return;
    recordActualTime(currentItemId);

    const currentIndex = items.findIndex(item => item.id === currentItemId);
    if (currentIndex !== -1 && currentIndex < items.length - 1) {
      setCurrentItemId(items[currentIndex + 1].id);
    } else {
      handleEndMeeting();
    }
  };

  if (isReflectionModeActive) {
    return <ReflectionView items={items} onClose={() => setIsReflectionModeActive(false)} />;
  }

  if (isMeetingActive) {
    const isLastItem = currentItemId === items[items.length -1]?.id;
    return (
      <div className="p-4">
        <MeetingViewList
          items={items}
          currentItemId={currentItemId}
          timerRemainingSeconds={timerRemainingSeconds}
        />
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleEndMeeting}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            End Meeting
          </button>
          <button
            onClick={handleNextItem}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isLastItem ? 'Finish Meeting' : 'Next Item'}
          </button>
        </div>
      </div>
    );
  }

  // Agenda Input / Post-meeting summary display
  const totalActualTime = calculateTotalActualTime();
  const totalPlannedTime = calculateTotalPlannedTime();
  const totalDiscrepancy = totalActualTime - totalPlannedTime;
  const showSummary = meetingJustEnded && items.some(item => item.actualTime !== undefined);

  return (
    <div className="p-4">
      {showSummary && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Last Meeting Summary:</h2>
            <button
                onClick={() => setIsReflectionModeActive(true)}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
                View Full Reflection
            </button>
          </div>
          <p>Total Planned Time: {totalPlannedTime} min</p>
          <p>Total Actual Time: {totalActualTime} min</p>
          <p className={totalDiscrepancy > 0 ? 'text-red-500' : 'text-green-500'}>
            Total Discrepancy: {totalDiscrepancy > 0 ? '+' : ''}{totalDiscrepancy} min
          </p>
        </div>
      )}

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleAddItem}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Agenda Item
        </button>
        {items.length > 0 && (
          <button
            onClick={handleStartMeeting}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Meeting
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <AgendaItemRow
            key={item.id}
            item={item}
            onNameChange={handleNameChange}
            onTimeChange={handleTimeChange}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-4 text-xl font-semibold">
          Total Planned Time: {calculateTotalPlannedTime()} min
        </div>
      )}
    </div>
  );
};

export default AgendaInputList;
