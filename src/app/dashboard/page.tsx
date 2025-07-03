
"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects, allTasks, financialData, recentActivity, resourceAllocation, weatherForecast, invoices, estimates, Task, allEvents, UnifiedEvent } from "@/lib/data";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  FileStack,
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Briefcase,
  ListChecks,
  Receipt,
  Users
} from "lucide-react";
import { FinancialSnapshotChart } from "@/components/dashboard/financial-snapshot-chart";
import { cn } from "@/lib/utils";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { ResourceAllocationChart } from "@/components/dashboard/resource-allocation-chart";
import { WeatherForecast } from "@/components/dashboard/weather-forecast";
import { QuickAddButton } from "@/components/quick-add-button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { format, isSameDay } from "date-fns";

const eventTypeConfig = {
  project: { icon: Briefcase, color: "border-chart-3", label: "Job Deadline" },
  task: { icon: ListChecks, color: "border-chart-1", label: "Task Due" },
  invoice: { icon: Receipt, color: "border-chart-2", label: "Invoice Due" },
  custom: { icon: Users, color: "border-chart-4", label: "Meeting" },
};

export default function DashboardPage() {
  const financialSummary = useMemo(() => {
    const totalIncome = financialData.reduce((acc, item) => acc + item.revenue, 0);
    const totalExpenses = financialData.reduce((acc, item) => acc + item.expenses, 0);
    const totalProfit = totalIncome - totalExpenses;
    
    const outstandingInvoices = invoices
      .filter(i => i.status === 'Sent' || i.status === 'Overdue')
      .reduce((acc, i) => acc + i.total, 0);
      
    const outstandingEstimates = estimates
      .filter(e => e.status === 'Sent')
      .reduce((acc, e) => acc + e.total, 0);

    return {
      totalIncome,
      totalExpenses,
      totalProfit,
      totalOutstanding: outstandingInvoices + outstandingEstimates,
      unbilledHours: 42, // Mock data
    }
  }, []);

  const attentionProjects = projects.filter(
    (p) => p.status === "At Risk" || p.status === "Off Track"
  );
  
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
  
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        return allEvents.filter(event => 
            isSameDay(event.date, selectedDate)
        ).sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [selectedDate]);

    const calendarModifiers = useMemo(() => {
        return {
            project: allEvents.filter(e => e.type === 'project').map(e => e.date),
            task: allEvents.filter(e => e.type === 'task').map(e => e.date),
            invoice: allEvents.filter(e => e.type === 'invoice').map(e => e.date),
            custom: allEvents.filter(e => e.type === 'custom').map(e => e.date),
        };
    }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane!</h1>
        <p className="text-muted-foreground">Here's your command center for today.</p>
      </div>
      
      {/* Financial KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">${financialSummary.totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
              Last 6 months
              </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">${financialSummary.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
              Last 6 months
              </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">${financialSummary.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
              Last 6 months
              </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <FileStack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">${financialSummary.totalOutstanding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
              Invoices and quotes
              </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unbilled Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{financialSummary.unbilledHours} hrs</div>
              <p className="text-xs text-muted-foreground">
              Across all projects
              </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
            <FinancialSnapshotChart data={financialData} />
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" />
                    Needs Your Attention
                </CardTitle>
                <CardDescription>
                    These projects are 'At Risk' or 'Off Track'. Review them to take action.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {attentionProjects.map((project) => (
                            <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block">
                                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors">
                                    <div>
                                        <p className="font-semibold">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">{project.manager}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {attentionProjects.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">All projects are on track!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <RecentActivityFeed activities={recentActivity} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <WeatherForecast forecasts={weatherForecast} />
           <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> Unified Calendar</CardTitle>
                            <CardDescription>Upcoming deadlines for jobs, tasks, and invoices.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                           <Link href="/dashboard/calendar">
                             View Full Calendar
                           </Link>
                        </Button>
                    </div>
                </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border p-0"
                    modifiers={calendarModifiers}
                    modifiersClassNames={{
                        project: "bg-chart-3/20 text-chart-3 rounded-full",
                        task: "bg-chart-1/20 text-chart-1 rounded-full",
                        invoice: "bg-chart-2/20 text-chart-2 rounded-full",
                        custom: "bg-chart-4/20 text-chart-4 rounded-full",
                    }}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                        Events for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => {
                       const config = eventTypeConfig[event.type];
                       const Icon = config.icon;
                       return (
                        <Link href={event.link || '#'} key={event.id}>
                            <div className={cn(
                                "p-2 rounded-md text-sm cursor-pointer hover:bg-muted border-l-4",
                                config.color,
                            )}>
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{event.title}</span>
                                </div>
                            </div>
                        </Link>
                    )}) : (
                        <p className="text-sm text-muted-foreground">No events for this day.</p>
                    )}
                    </div>
                </div>
            </CardContent>
          </Card>
          <ResourceAllocationChart data={resourceAllocation} />
        </div>
      </div>
      <QuickAddButton />
    </div>
  );
}
