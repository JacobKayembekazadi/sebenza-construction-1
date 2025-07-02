"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { type Resource } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ResourceAllocationChartProps {
  data: Resource[]
}

const getBarColor = (utilization: number) => {
  if (utilization > 100) return "hsl(var(--destructive))";
  if (utilization > 80) return "hsl(var(--chart-2))";
  return "hsl(var(--chart-1))";
}

export function ResourceAllocationChart({ data }: ResourceAllocationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Allocation</CardTitle>
        <CardDescription>Team utilization overview</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
             <XAxis type="number" domain={[0, 120]} tickFormatter={(value) => `${value}%`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
             <YAxis type="category" dataKey="name" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                        <div className="bg-card p-2 border rounded-md shadow-lg text-card-foreground">
                            <p className="font-bold">{`${payload[0].payload.name}`}</p>
                            <p>{`Utilization: ${payload[0].value}%`}</p>
                        </div>
                        );
                    }
                    return null;
                }}
            />
            <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.utilization)} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
