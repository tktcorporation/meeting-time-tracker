import React from 'react';
import type { AgendaItem } from '../lib/schemas';

interface ReflectionViewProps {
  items: AgendaItem[];
  onClose: () => void;
}

const ReflectionView: React.FC<ReflectionViewProps> = ({ items, onClose }) => {
  const barMultiplier = 5; // Adjust this to scale bars appropriately

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Meeting Reflection</h1>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Agenda Setup
        </button>
      </div>

      {/* Data Table Section */}
      <div className="mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3">Summary Table</h2>
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Topic</th>
              <th className="py-2 px-4 border-b text-right">Planned (min)</th>
              <th className="py-2 px-4 border-b text-right">Actual (min)</th>
              <th className="py-2 px-4 border-b text-right">Discrepancy (min)</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const discrepancy = item.actualTime !== undefined ? item.actualTime - item.plannedTime : null;
              let discrepancyColor = 'text-gray-700';
              if (discrepancy !== null) {
                if (discrepancy > 0) discrepancyColor = 'text-red-500';
                else if (discrepancy < 0) discrepancyColor = 'text-green-500';
              }

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b text-right">{item.plannedTime}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {item.actualTime !== undefined ? item.actualTime : 'N/A'}
                  </td>
                  <td className={`py-2 px-4 border-b text-right ${discrepancyColor}`}>
                    {discrepancy !== null ? (discrepancy > 0 ? '+' : '') + discrepancy : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Simplified Bar Chart Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Visual Comparison</h2>
        <div className="space-y-6">
          {items.filter(item => item.actualTime !== undefined).map(item => (
            <div key={item.id} className="p-3 border rounded">
              <p className="font-medium mb-2">{item.name}</p>
              <div className="space-y-2">
                {/* Planned Time Bar */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm w-20">Planned:</span>
                  <div
                    style={{
                      width: `${item.plannedTime * barMultiplier}px`,
                      minWidth: '20px', // Ensure very small times are visible
                      backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500 with opacity
                      height: '24px',
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{item.plannedTime} min</span>
                </div>
                {/* Actual Time Bar */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm w-20">Actual:</span>
                  <div
                    style={{
                      width: `${(item.actualTime || 0) * barMultiplier}px`,
                      minWidth: '20px',
                      backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500 with opacity
                      height: '24px',
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{item.actualTime} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReflectionView;
