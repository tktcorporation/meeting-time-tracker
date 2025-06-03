import { createFileRoute } from '@tanstack/react-router';
import AgendaInputList from '../components/AgendaInputList';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meeting Time Tracker</h1>
      <AgendaInputList />
    </div>
  );
}
