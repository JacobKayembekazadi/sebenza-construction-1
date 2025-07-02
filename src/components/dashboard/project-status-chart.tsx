"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { type Project } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProjectStatusChartProps {
  projects: Project[]
}

const COLORS = {
  "On Track": "hsl(var(--chart-1))",
  "At Risk": "hsl(var(--chart-2))",
  "Off Track": "hsl(var(--destructive))",
}

const statusVariant = (status: string) => {
    switch (status) {
      case "On Track":
        return "default";
      case "At Risk":
        return "secondary";
      case "Off Track":
        return "destructive";
      default:
        return "outline";
    }
  };

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {} as Record<Project["status"], number>)

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status Overview</CardTitle>
        <CardDescription>A summary of project health across your portfolio.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  stroke="hsl(var(--background))"
                  strokeWidth={4}
                >
                  {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "hsl(var(--radius))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {data.map((entry) => (
              <div key={entry.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                  />
                  <span>{entry.name}</span>
                </div>
                <Badge variant={statusVariant(entry.name)} className="font-bold">{entry.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
