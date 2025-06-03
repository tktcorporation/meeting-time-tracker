import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import AgendaItem from "./AgendaItem";
import { AgendaItemProps } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";


interface AgendaTableProps {
  items: AgendaItemProps[];
  currentAgendaItemId: string | null;
  currentAgendaItemRemainingTime: number;
}

export default function AgendaTable({ items, currentAgendaItemId, currentAgendaItemRemainingTime }: AgendaTableProps) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No agenda items yet. Add some above!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap px-2 sm:px-4 min-w-[150px]">議題名</TableHead>
            <TableHead className="whitespace-nowrap px-2 sm:px-4 text-right sm:text-left min-w-[100px]">予定/残り</TableHead>
            <TableHead className="whitespace-nowrap px-2 sm:px-4 text-right sm:text-left min-w-[100px]">実時間</TableHead>
            <TableHead className="whitespace-nowrap px-2 sm:px-4 text-right sm:text-left min-w-[100px]">ズレ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <AgendaItem
              key={item.id}
              item={item}
              isActive={item.id === currentAgendaItemId}
              remainingTime={item.id === currentAgendaItemId ? currentAgendaItemRemainingTime : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
