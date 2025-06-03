import React from 'react';

interface TimerDisplayProps {
  seconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
  const formatTime = (totalSecs: number): string => {
    const isNegative = totalSecs < 0;
    const absSecs = Math.abs(totalSecs);
    const mins = Math.floor(absSecs / 60);
    const secs = absSecs % 60;
    return `${isNegative ? '+' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`text-2xl font-bold ${seconds < 0 ? 'text-red-500' : ''}`}>
      {formatTime(seconds)}
    </div>
  );
};

export default TimerDisplay;
