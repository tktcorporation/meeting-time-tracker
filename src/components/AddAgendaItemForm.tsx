import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AgendaItemProps } from "@/types";
import { toast } from "sonner"; // Import toast from sonner
import { cn } from "@/lib/utils"; // Import cn for conditional styling

interface AddAgendaItemFormProps {
  onAddItem: (itemData: Omit<AgendaItemProps, 'id' | 'actualTime' | 'timeDifference'>) => void;
  isMeetingActive?: boolean;
}

export default function AddAgendaItemForm({ onAddItem, isMeetingActive }: AddAgendaItemFormProps) {
  const [topicName, setTopicName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isMeetingActive) {
      toast.warning("Cannot add items now.", { description: "Meeting is currently in progress." });
      return;
    }
    const time = parseInt(estimatedTime, 10);

    if (!topicName.trim()) {
      toast.error("Topic name required.", { description: "Please enter a name for the agenda item." });
      return;
    }
    if (isNaN(time) || time <= 0) {
      toast.error("Invalid time.", { description: "Estimated time must be a positive number." });
      return;
    }

    onAddItem({ name: topicName, estimatedTime: time });
    toast.success("Item Added", { description: `"${topicName}" added to the agenda.`});
    setTopicName("");
    setEstimatedTime("");
  };

  return (
    <Card className={cn("mb-4", isMeetingActive && "opacity-50 cursor-not-allowed")}>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Add New Agenda Item</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="topicName" className="text-sm sm:text-base">議題名 (Topic Name)</Label>
              <Input
                id="topicName"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Enter topic name"
                className="mt-1"
                disabled={isMeetingActive}
              />
            </div>
            <div>
              <Label htmlFor="estimatedTime" className="text-sm sm:text-base">予定時間（分）(Estimated Time - minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Enter estimated time in minutes"
                className="mt-1"
                disabled={isMeetingActive}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full sm:w-auto" disabled={isMeetingActive}>Add Item</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
