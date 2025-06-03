import { useState, useEffect, useCallback } from "react";
import AgendaTable from "./components/AgendaTable";
import AddAgendaItemForm from "./components/AddAgendaItemForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgendaItemProps } from "./types";
import ReviewMode from "./components/ReviewMode";
import { Toaster } from "@/components/ui/sonner"; // Import Sonner Toaster
import { toast } from "sonner"; // Import toast function from sonner

const LOCAL_STORAGE_AGENDA_KEY = 'meetingTimeTracker_currentAgenda';
const LOCAL_STORAGE_TEMPLATES_KEY = 'meetingTimeTracker_savedTemplates';

type OverallMeetingProgress = 'NotStarted' | 'InProgress' | 'Paused' | 'Finished';
interface SavedTemplate {
  name: string;
  items: Pick<AgendaItemProps, 'name' | 'estimatedTime'>[];
}

export default function App() {
  const [agendaItems, setAgendaItems] = useState<AgendaItemProps[]>(() => {
    try {
      const savedAgenda = localStorage.getItem(LOCAL_STORAGE_AGENDA_KEY);
      if (savedAgenda) {
        // Ensure loaded items have all necessary fields, especially for older saved data
        const parsedAgenda = JSON.parse(savedAgenda) as AgendaItemProps[];
        return parsedAgenda.map(item => ({
          id: item.id || Date.now().toString() + Math.random().toString(36).substring(2,9), // Ensure ID exists
          name: item.name || "Untitled",
          estimatedTime: item.estimatedTime || 0,
          actualTime: item.actualTime,
          timeDifference: item.timeDifference,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading agenda from local storage:", error);
      toast.error("Failed to load agenda from local storage.");
      return [];
    }
  });

  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0);
  const [isMeetingRunning, setIsMeetingRunning] = useState(false);
  const [currentAgendaItemId, setCurrentAgendaItemId] = useState<string | null>(null);
  const [currentAgendaItemRemainingTime, setCurrentAgendaItemRemainingTime] = useState(0); // in seconds
  const [overallMeetingProgress, setOverallMeetingProgress] = useState<OverallMeetingProgress>('NotStarted');
  const [totalActualTime, setTotalActualTime] = useState(0); // in minutes
  const [isReviewModeActive, setIsReviewModeActive] = useState(false);

  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => {
    try {
      const storedTemplates = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
      return storedTemplates ? JSON.parse(storedTemplates) : [];
    } catch (error) {
      console.error("Error loading templates from local storage:", error);
      toast.error("Failed to load templates from local storage.");
      return [];
    }
  });
  const [newTemplateName, setNewTemplateName] = useState("");
  const [selectedTemplateToLoad, setSelectedTemplateToLoad] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_AGENDA_KEY, JSON.stringify(agendaItems));
    } catch (error) {
      console.error("Error saving agenda to local storage:", error);
      toast.error("Failed to save current agenda. Local storage might be full or disabled.");
    }
  }, [agendaItems]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(savedTemplates));
    } catch (error) {
      console.error("Error saving templates to local storage:", error);
      toast.error("Failed to save templates. Local storage might be full or disabled.");
    }
  }, [savedTemplates]);

  const handleAddItem = (itemData: Omit<AgendaItemProps, 'id' | 'actualTime' | 'timeDifference'>) => {
    if (isMeetingRunning && overallMeetingProgress !== 'Finished' && overallMeetingProgress !== 'NotStarted') {
      toast.warning("Cannot add items while a meeting is in progress.", { description: "Please finish or reset the current meeting."});
      return;
    }
    const newItem: AgendaItemProps = {
      ...itemData,
      id: Date.now().toString(), // Ensure new ID for each item
      actualTime: undefined,
      timeDifference: undefined,
    };
    setAgendaItems((prevItems) => [...prevItems, newItem]);
  };

  useEffect(() => {
    const totalEst = agendaItems.reduce((sum, item) => sum + item.estimatedTime, 0);
    setTotalEstimatedTime(totalEst);

    const totalAct = agendaItems.reduce((sum, item) => sum + (item.actualTime || 0), 0);
    setTotalActualTime(totalAct);

  }, [agendaItems]);

  const resetMeetingState = () => {
    setIsMeetingRunning(false);
    setCurrentAgendaItemId(null);
    setCurrentAgendaItemRemainingTime(0);
    setOverallMeetingProgress('NotStarted');
    // We don't reset totalActualTime here as it's derived from agendaItems
    // Individual actualTimes and timeDifferences should be reset if needed when loading a template or restarting
  };


  const handleStartMeeting = () => {
    if (agendaItems.length === 0) {
      alert("Please add agenda items before starting the meeting.");
      return;
    }
    // Reset actual times and differences for all items before starting a new meeting
    const resetItems = agendaItems.map(item => ({
      ...item,
      actualTime: undefined,
      timeDifference: undefined
    }));
    setAgendaItems(resetItems);

    setIsMeetingRunning(true);
    setOverallMeetingProgress('InProgress');
    // Use the resetItems array to get the first item to ensure state consistency
    const firstItem = resetItems[0];
    setCurrentAgendaItemId(firstItem.id);
    setCurrentAgendaItemRemainingTime(firstItem.estimatedTime * 60);
    // totalActualTime will be recalculated by useEffect based on resetItems
    setIsReviewModeActive(false);
  };

  const advanceToNextItem = useCallback(() => {
    const currentItemIndex = agendaItems.findIndex(item => item.id === currentAgendaItemId);

    if (currentItemIndex === -1) return;

    const finishedItem = agendaItems[currentItemIndex];
    if (!finishedItem) return; // Should not happen if index is valid

    const estimatedSeconds = finishedItem.estimatedTime * 60;
    let actualTimeTakenInSeconds: number;

    if (currentAgendaItemRemainingTime >= 0) {
      actualTimeTakenInSeconds = estimatedSeconds - currentAgendaItemRemainingTime;
    } else {
      actualTimeTakenInSeconds = estimatedSeconds + Math.abs(currentAgendaItemRemainingTime);
    }

    const actualTimeInMinutes = actualTimeTakenInSeconds / 60;
    const timeDifferenceInMinutes = actualTimeInMinutes - finishedItem.estimatedTime;

    setAgendaItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === finishedItem.id ? {
          ...item,
          actualTime: actualTimeInMinutes,
          timeDifference: timeDifferenceInMinutes
        } : item
      );
      const newTotalActualTime = updatedItems.reduce((sum, item) => sum + (item.actualTime || 0), 0);
      setTotalActualTime(newTotalActualTime);
      return updatedItems;
    });

    const nextItemIndex = currentItemIndex + 1;
    if (nextItemIndex < agendaItems.length) {
      const nextItem = agendaItems[nextItemIndex];
      setCurrentAgendaItemId(nextItem.id);
      setCurrentAgendaItemRemainingTime(nextItem.estimatedTime * 60);
    } else {
      setIsMeetingRunning(false);
      setCurrentAgendaItemId(null);
      setOverallMeetingProgress('Finished');
      setIsReviewModeActive(true); // Automatically switch to review mode when meeting finishes
    }
  }, [agendaItems, currentAgendaItemId, currentAgendaItemRemainingTime, overallMeetingProgress]); // Added overallMeetingProgress dependency

  useEffect(() => {
    if (!isMeetingRunning || !currentAgendaItemId || overallMeetingProgress !== 'InProgress') {
      return;
    }
    if (currentAgendaItemRemainingTime <= 0) {
      advanceToNextItem(); // This will also handle the overdue case by its internal logic
      return;
    }
    const timer = setInterval(() => {
      setCurrentAgendaItemRemainingTime((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isMeetingRunning, currentAgendaItemId, currentAgendaItemRemainingTime, advanceToNextItem, overallMeetingProgress]);

  const toggleReviewMode = () => {
    const completedItems = agendaItems.filter(item => typeof item.actualTime === 'number');
    if (completedItems.length === 0 && !isReviewModeActive) {
        alert("No items have been completed yet. Finish some items or a meeting to see the review.");
        return;
    }
    setIsReviewModeActive(!isReviewModeActive);
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      alert("Please enter a name for the template.");
      return;
    }
    if (agendaItems.length === 0) {
      alert("Cannot save an empty agenda as a template.");
      return;
    }
    if (savedTemplates.some(template => template.name === newTemplateName.trim())) {
      alert(`A template with the name "${newTemplateName.trim()}" already exists. Please choose a different name.`);
      return;
    }
    const templateItems = agendaItems.map(({ name, estimatedTime }) => ({ name, estimatedTime }));
    setSavedTemplates(prevTemplates => [...prevTemplates, { name: newTemplateName.trim(), items: templateItems }]);
    setNewTemplateName("");
    alert(`Template "${newTemplateName.trim()}" saved successfully!`);
  };

  const handleLoadTemplate = () => {
    if (!selectedTemplateToLoad) {
      alert("Please select a template to load.");
      return;
    }
    const template = savedTemplates.find(t => t.name === selectedTemplateToLoad);
    if (template) {
      const newAgendaItems = template.items.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More robust unique ID
        actualTime: undefined,
        timeDifference: undefined,
      }));
      setAgendaItems(newAgendaItems);
      resetMeetingState();
      setIsReviewModeActive(false);
      alert(`Template "${template.name}" loaded successfully!`);
    }
  };

  const handleDeleteTemplate = (templateNameToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateNameToDelete}"?`)) {
      setSavedTemplates(prevTemplates => prevTemplates.filter(t => t.name !== templateNameToDelete));
      if (selectedTemplateToLoad === templateNameToDelete) {
        setSelectedTemplateToLoad(""); // Clear selection if deleted template was selected
      }
      alert(`Template "${templateNameToDelete}" deleted.`);
    }
  };


  // Main Render
  if (isReviewModeActive) {
    return (
      <div className="container mx-auto p-4">
        <header className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meeting Review</h1>
          <Button onClick={toggleReviewMode} variant="outline">
            Back to Timer View
          </Button>
        </header>
        <ReviewMode agendaItems={agendaItems} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meeting Time Tracker</h1>
        <Button onClick={toggleReviewMode} variant="outline" disabled={agendaItems.length === 0 && !isReviewModeActive && !overallMeetingProgress.includes('Finished') && !agendaItems.some(item => item.actualTime !== undefined)}>
          {isReviewModeActive ? "Back to Timer" : "View Review"}
        </Button>
      </header>

      {/* Template Management Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agenda Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="New template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
            <Button onClick={handleSaveAsTemplate} disabled={agendaItems.length === 0}>Save Current as Template</Button>
          </div>
          {savedTemplates.length > 0 && (
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <Label htmlFor="load-template-select">Load Template</Label>
                <Select value={selectedTemplateToLoad} onValueChange={setSelectedTemplateToLoad}>
                  <SelectTrigger id="load-template-select">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedTemplates.map(template => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleLoadTemplate} disabled={!selectedTemplateToLoad}>Load</Button>
              <Button
                variant="destructive"
                onClick={() => selectedTemplateToLoad && handleDeleteTemplate(selectedTemplateToLoad)}
                disabled={!selectedTemplateToLoad}
              >
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Meeting Interface */}
      <AddAgendaItemForm onAddItem={handleAddItem} />
      <div className="my-4 flex space-x-2">
        <Button
          onClick={handleStartMeeting}
          disabled={(isMeetingRunning && overallMeetingProgress !== 'Finished') || agendaItems.length === 0}
        >
          {overallMeetingProgress === 'Finished' ? 'Restart Meeting' : (isMeetingRunning ? 'Meeting in Progress' : 'Start Meeting')}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-2">Overall Progress: {overallMeetingProgress}</div>

      <AgendaTable
        items={agendaItems}
        currentAgendaItemId={currentAgendaItemId}
        currentAgendaItemRemainingTime={currentAgendaItemRemainingTime}
      />

      <div className="mt-4 flex justify-end space-x-4">
        <div>Total Estimated Time: <span className="font-bold">{totalEstimatedTime.toFixed(1)} min</span></div>
        <div>Total Actual Time: <span className="font-bold">{totalActualTime.toFixed(1)} min</span></div>
      </div>
    </div>
  );
}

// Helper components from shadcn/ui (Card, Label - if not already globally available)
// Ensure these are either imported or defined if not using the CLI to add all components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
