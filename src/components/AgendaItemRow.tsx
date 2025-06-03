import React from 'react';
import type { AgendaItem } from '../lib/schemas';

interface AgendaItemRowProps {
  item: Pick<AgendaItem, 'id' | 'name' | 'plannedTime'>;
  onNameChange: (id: string, name: string) => void;
  onTimeChange: (id: string, time: number) => void;
  onRemove: (id: string) => void;
}

const AgendaItemRow: React.FC<AgendaItemRowProps> = ({
  item,
  onNameChange,
  onTimeChange,
  onRemove,
}) => {
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(item.id, e.target.value);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value, 10);
    if (!isNaN(time)) {
      onTimeChange(item.id, time);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 border-b">
      <input
        type="text"
        value={item.name}
        onChange={handleNameInputChange}
        className="border p-1 flex-grow"
        placeholder="Agenda item name"
      />
      <input
        type="number"
        value={item.plannedTime}
        onChange={handleTimeInputChange}
        className="border p-1 w-20"
        min="1"
      />
      <span>min</span>
      <button
        onClick={() => onRemove(item.id)}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
      >
        Remove
      </button>
    </div>
  );
};

export default AgendaItemRow;
