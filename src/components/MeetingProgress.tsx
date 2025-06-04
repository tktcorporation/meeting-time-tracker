import {
  CheckCircle2,
  Circle,
  Edit,
  GripVertical,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { EmptyState } from "./EmptyState";
import { TimeInput } from "./TimeInput";

interface AgendaItem {
  id: string;
  name: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  isActive: boolean;
  startTime?: number;
  elapsedTime: number;
}

interface MeetingProgressProps {
  items: AgendaItem[];
  onItemClick?: (index: number) => void;
  onItemEdit?: (index: number, name: string, estimatedMinutes: number) => void;
  onItemDelete?: (index: number) => void;
  onItemAdd?: (name: string, estimatedMinutes: number) => void;
  onItemReorder?: (fromIndex: number, toIndex: number) => void;
  onAddSample?: () => void;
  isTimerRunning?: boolean;
  getCurrentElapsed?: (item: AgendaItem) => number;
}

/**
 * Unified agenda management and progress tracking component.
 *
 * This component serves as the central hub for managing agenda items and tracking meeting progress.
 * It handles empty state display, item creation, editing, deletion, and real-time progress visualization.
 * Integrates all agenda-related functionality into a single, cohesive interface.
 *
 * @param items - Array of agenda items with tracking data
 * @param onItemClick - Callback when timeline circle is clicked (completes active items)
 * @param onItemEdit - Callback to update an existing agenda item
 * @param onItemDelete - Callback to remove an agenda item
 * @param onItemAdd - Callback to create a new agenda item
 * @param onItemReorder - Callback to reorder agenda items by drag and drop
 * @param onAddSample - Callback to populate with sample data
 * @param isTimerRunning - Whether the meeting timer is currently running
 * @param getCurrentElapsed - Function to get current elapsed time for an item
 */
export function MeetingProgress({
  items,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onItemAdd,
  onItemReorder,
  onAddSample,
  isTimerRunning = false,
  getCurrentElapsed = () => 0,
}: MeetingProgressProps) {
  const { t } = useLanguage();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState(5);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemTime, setNewItemTime] = useState(5);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const totalEstimated = items.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0,
  );
  const totalCompleted = items.reduce(
    (sum, item) => sum + (item.actualMinutes || 0),
    0,
  );
  const progressPercentage =
    totalEstimated > 0 ? (totalCompleted / totalEstimated) * 100 : 0;

  /**
   * Initiates editing mode for an existing agenda item.
   * Populates edit form with current item data and switches UI to edit state.
   *
   * @param index - Zero-based index of the item to edit in the items array
   */
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(items[index].name);
    setEditTime(items[index].estimatedMinutes);
  };

  /**
   * Saves changes to an agenda item being edited.
   * Validates input and calls parent callback to persist changes, then resets edit state.
   * Only saves if name is non-empty and time is valid.
   */
  const saveEdit = () => {
    if (editingIndex !== null && editName.trim() && editTime) {
      onItemEdit?.(editingIndex, editName.trim(), editTime);
      setEditingIndex(null);
      setEditName("");
      setEditTime(5);
    }
  };

  /**
   * Cancels editing of an agenda item.
   * Resets all edit state without saving changes, returning to view mode.
   */
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
    setEditTime(5);
  };

  /**
   * Initiates creation of a new agenda item.
   * Switches UI to add mode and clears new item form fields.
   */
  const startAddNew = () => {
    setIsAddingNew(true);
    setNewItemName("");
    setNewItemTime(5);
  };

  /**
   * Creates a new agenda item with validated input.
   * Calls parent callback to add item to the list, then resets add form state.
   * Only creates item if name is non-empty and time is valid.
   */
  const saveNewItem = () => {
    if (newItemName.trim() && newItemTime && onItemAdd) {
      onItemAdd(newItemName.trim(), newItemTime);
      setIsAddingNew(false);
      setNewItemName("");
      setNewItemTime(5);
    }
  };

  /**
   * Cancels creation of a new agenda item.
   * Resets add form state and returns to normal view without creating item.
   */
  const cancelAddNew = () => {
    setIsAddingNew(false);
    setNewItemName("");
    setNewItemTime(5);
  };

  /**
   * Handles drag start event for reordering agenda items.
   * Records the index of the item being dragged.
   * 
   * @param index - Zero-based index of the item being dragged
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  /**
   * Handles drag over event to allow dropping.
   * Prevents default behavior to enable drop functionality.
   * 
   * @param e - Drag event object
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  /**
   * Handles drop event for reordering agenda items.
   * Calls parent callback to reorder items and resets drag state.
   * 
   * @param e - Drag event object
   * @param dropIndex - Zero-based index where the item should be dropped
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onItemReorder) {
      onItemReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  /**
   * Handles drag end event to clean up drag state.
   * Resets dragged index regardless of whether drop was successful.
   */
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Empty state when no items */}
      {items.length === 0 && !isAddingNew && (
        <EmptyState onAddSample={onAddSample} />
      )}

      {/* Overall progress bar - only show when items exist */}
      {items.length > 0 && (
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
            <div
              className="absolute top-1/2 -translate-y-1/2 text-xs font-medium text-primary-foreground"
              style={{ left: `${Math.min(progressPercentage, 95)}%` }}
            >
              {Math.round(progressPercentage)}%
            </div>
          )}
        </div>
      )}

      {/* Add new item form - allow even when timer is running */}
      {isAddingNew ? (
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="space-y-3">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder={t("agenda.topicNamePlaceholder")}
            />
            <div className="flex items-center gap-2">
              <TimeInput
                value={newItemTime}
                onChange={setNewItemTime}
                className="flex-shrink-0"
              />
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={saveNewItem}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelAddNew}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={startAddNew}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("agenda.add")}
          </button>
        </div>
      )}

      {/* Visual timeline */}
      <div className="relative">
        {items.map((item, index) => {
          const isCompleted = !!item.actualMinutes;
          const isLast = index === items.length - 1;
          const isDragging = draggedIndex === index;

          return (
            <div 
              key={item.id} 
              className={`flex items-start gap-4 group relative transition-all duration-200 ${
                isDragging ? 'opacity-50 scale-95' : ''
              }`}
              draggable={onItemReorder && !item.isActive}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag handle */}
              {onItemReorder && !item.isActive && (
                <div 
                  className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              {/* Timeline connector */}
              <div className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onItemClick?.(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
										${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : item.isActive
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-muted hover:bg-muted-foreground/20"
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
                  <div
                    className={`w-0.5 h-16 -mt-1 transition-colors
										${isCompleted ? "bg-green-500" : "bg-border"}`}
                  />
                )}
              </div>

              {/* Item details */}
              <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                {editingIndex === index ? (
                  <div className="space-y-3">
                    {isCompleted && (
                      <div className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                        ⚠️ This item is already completed. Editing will not
                        affect recorded time.
                      </div>
                    )}
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                      placeholder={t("agenda.topicNamePlaceholder")}
                    />
                    <div className="flex items-center gap-2">
                      <TimeInput
                        value={editTime}
                        onChange={setEditTime}
                        className="flex-shrink-0"
                      />
                      <div className="flex gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <h4
                        className={`font-medium transition-colors
												${item.isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {item.name}
                      </h4>
                      {onItemEdit && onItemDelete && (
                        <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => startEdit(index)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onItemDelete(index)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Delete item"
                            disabled={item.isActive}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {item.estimatedMinutes} min
                      </span>
                      {item.isActive && (
                        <span className="text-sm font-medium text-primary">
                          {(() => {
                            const elapsedMs = getCurrentElapsed(item);
                            const estimatedMs = item.estimatedMinutes * 60000;
                            const remainingMs = Math.max(
                              0,
                              estimatedMs - elapsedMs,
                            );
                            const isOvertime = elapsedMs > estimatedMs;

                            if (isOvertime) {
                              const overtimeMs = elapsedMs - estimatedMs;
                              const overtimeMin = Math.floor(
                                overtimeMs / 60000,
                              );
                              const overtimeSec = Math.floor(
                                (overtimeMs % 60000) / 1000,
                              );
                              return `+${overtimeMin}:${overtimeSec.toString().padStart(2, "0")}`;
                            }
                            const remainingMin = Math.floor(
                              remainingMs / 60000,
                            );
                            const remainingSec = Math.floor(
                              (remainingMs % 60000) / 1000,
                            );
                            return `${remainingMin}:${remainingSec.toString().padStart(2, "0")} left`;
                          })()}
                        </span>
                      )}
                      {item.actualMinutes && (
                        <span
                          className={`text-sm font-medium
													${item.actualMinutes > item.estimatedMinutes ? "text-destructive" : "text-green-600 dark:text-green-500"}`}
                        >
                          {item.actualMinutes > item.estimatedMinutes
                            ? "+"
                            : "-"}
                          {Math.abs(item.actualMinutes - item.estimatedMinutes)}{" "}
                          min
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
                )}
              </div>
            </div>
          );
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
              <span
                className={`font-medium ${
                  totalCompleted > totalEstimated
                    ? "text-destructive"
                    : "text-green-600 dark:text-green-500"
                }`}
              >
                {totalCompleted > totalEstimated ? "+" : "-"}
                {Math.abs(
                  Math.round((totalCompleted - totalEstimated) * 10) / 10,
                )}{" "}
                min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
