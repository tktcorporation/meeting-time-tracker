import { AgendaItemProps } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewModeProps {
  agendaItems: AgendaItemProps[];
}

export default function ReviewMode({ agendaItems }: ReviewModeProps) {
  const completedItems = agendaItems.filter(item => typeof item.actualTime === 'number');

  if (completedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Meeting Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base">No agenda items have been completed yet. Please complete some items in the meeting to see a review.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = completedItems.map(item => ({
    name: item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name,
    fullName: item.name,
    estimated: item.estimatedTime,
    actual: item.actualTime,
  }));

  const formatTimeDifference = (diff: number | undefined) => {
    if (typeof diff === 'number') {
      const sign = diff > 0 ? "+" : (diff < 0 ? "" : "");
      return `${sign}${diff.toFixed(1)} min`;
    }
    return "-";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border p-2 shadow-lg rounded text-sm">
          <p className="font-bold mb-1">{data.fullName}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)} min`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Meeting Summary Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, 50 + completedItems.length * 40)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit=" min" tick={{ fontSize: '0.75rem' }} />
              <YAxis
                dataKey="name"
                type="category"
                interval={0}
                width={80}
                tick={{ fontSize: '0.75rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
              <Bar dataKey="estimated" fill="#8884d8" name="Estimated" unit=" min">
                <LabelList dataKey="estimated" position="right" formatter={(value: number) => `${value.toFixed(1)}`} style={{ fontSize: '0.75rem' }} />
              </Bar>
              <Bar dataKey="actual" fill="#82ca9d" name="Actual" unit=" min">
                 <LabelList dataKey="actual" position="right" formatter={(value: number) => `${value.toFixed(1)}`} style={{ fontSize: '0.75rem' }}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Detailed Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-sm sm:text-base">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 sm:px-4 whitespace-nowrap min-w-[120px]">議題名</TableHead>
                  <TableHead className="px-2 sm:px-4 whitespace-nowrap text-right sm:text-left min-w-[100px]">想定時間</TableHead>
                  <TableHead className="px-2 sm:px-4 whitespace-nowrap text-right sm:text-left min-w-[100px]">実時間</TableHead>
                  <TableHead className="px-2 sm:px-4 whitespace-nowrap text-right sm:text-left min-w-[100px]">ズレ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium py-2 px-2 sm:px-4 break-words min-w-[120px] max-w-[250px] sm:max-w-none">{item.name}</TableCell>
                    <TableCell className="py-2 px-2 sm:px-4 text-right sm:text-left">{item.estimatedTime.toFixed(1)} min</TableCell>
                    <TableCell className="py-2 px-2 sm:px-4 text-right sm:text-left">{(item.actualTime ?? 0).toFixed(1)} min</TableCell>
                    <TableCell className="py-2 px-2 sm:px-4 text-right sm:text-left">{formatTimeDifference(item.timeDifference)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
