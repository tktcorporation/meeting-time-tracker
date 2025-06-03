export interface AgendaItemProps {
  id: string;
  name: string;
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  timeDifference?: number; // in minutes
}
