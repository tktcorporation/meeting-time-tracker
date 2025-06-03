import { TableCell, TableRow } from "@/components/ui/table";
import { AgendaItemProps } from "@/types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AgendaItemDisplayProps {
  item: AgendaItemProps;
  isActive: boolean;
  remainingTime?: number; // in seconds
}

export default function AgendaItem({ item, isActive, remainingTime }: AgendaItemDisplayProps) {
  const displayActualTime = () => {
    if (typeof item.actualTime === 'number') {
      return `${item.actualTime.toFixed(1)} min`;
    }
    return isActive ? "-" : "-";
  };

  const displayTimeDifference = () => {
    if (typeof item.timeDifference === 'number') {
      const sign = item.timeDifference > 0 ? "+" : (item.timeDifference < 0 ? "" : ""); // No sign for 0
      return `${sign}${item.timeDifference.toFixed(1)} min`;
    }
    return "-";
  };

  return (
    <TableRow key={item.id} className={cn(isActive && "bg-muted/50", "text-sm sm:text-base")}>
      <TableCell className="font-medium py-2 px-2 sm:px-4 break-words min-w-[150px] max-w-[300px] sm:max-w-none">{item.name}</TableCell>
      <TableCell className="py-2 px-2 sm:px-4 text-right sm:text-left">
        {isActive && typeof remainingTime === 'number' ? (
          <span className={cn(remainingTime < 0 && "text-red-500 font-semibold")}>
            {formatTime(remainingTime)}
          </span>
        ) : (
          `${item.estimatedTime.toFixed(1)} min`
        )}
      </TableCell>
      <TableCell className="py-2 px-2 sm:px-4 text-right sm:text-left">{displayActualTime()}</TableCell>
      <TableCell className="py-2 px-2 sm:px-4 text-right sm:text-left">{displayTimeDifference()}</TableCell>
    </TableRow>
  );
}
