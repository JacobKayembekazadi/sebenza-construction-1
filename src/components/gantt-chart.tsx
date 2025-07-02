"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { type Task } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GanttChartProps {
  tasks: Task[];
}

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Done":
      return "hsl(var(--primary))";
    case "In Progress":
      return "hsl(var(--accent))";
    case "To Do":
      return "hsl(var(--muted))";
    default:
      return "#cccccc";
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const startDate = new Date(data.range[0]).toLocaleDateString();
    const endDate = new Date(data.range[1]).toLocaleDateString();
    return (
      <div className="bg-card p-2 border rounded-md shadow-lg text-card-foreground">
        <p className="font-bold">{label}</p>
        <p>Status: {data.status}</p>
        <p>Assignee: {data.assignee.name}</p>
        <p>
          Duration: {startDate} - {endDate}
        </p>
      </div>
    );
  }
  return null;
};

export function GanttChart({ tasks }: GanttChartProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No tasks to display in the timeline.
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = tasks.map((task) => ({
    name: task.name,
    range: [task.startDate.getTime(), task.dueDate.getTime()],
    ...task,
  }));

  const minTimestamp = Math.min(...data.map(d => d.range[0]));
  const maxTimestamp = Math.max(...data.map(d => d.range[1]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            barCategoryGap={30}
          >
            <XAxis
              type="number"
              domain={[minTimestamp, maxTimestamp]}
              tickFormatter={(time) => new Date(time).toLocaleDateString()}
              scale="time"
            />
            <YAxis type="category" dataKey="name" width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="range" minPointSize={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
