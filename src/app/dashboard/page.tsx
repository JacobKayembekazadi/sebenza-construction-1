
"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects, allTasks, financialData, recentActivity, resourceAllocation, weatherForecast, invoices, estimates, Task } from "@/lib/data";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  ListChecks,
  TrendingUp,
  TrendingDown,
  Scale,
  FileStack,
  Clock,
  UserPlus,
  Receipt,
  FileSignature,
  Landmark,
  Calendar,
} from "lucide-react";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { cn } from "@/lib/utils";
import { FinancialSnapshotChart } from "@/components/dashboard/financial-snapshot-chart";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { ResourceAllocationChart } from "@/components/dashboard/resource-allocation-chart";
import { WeatherForecast } from "@/components/dashboard/weather-forecast";
import { QuickAddButton } from "@/components/quick-add-button";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const MyTaskDueDate = ({ dueDate }: { dueDate: Date }) => {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dueDateText: string;
        if (diffDays < 0) {
            dueDateText = `${Math.abs(diffDays)}d overdue`;
        } else if (diffDays === 0) {
            dueDateText = 'Due today';
        } else {
            dueDateText = `in ${diffDays}d`;
        }
        setText(dueDateText);
    }, [dueDate]);

    const isOverdue = text?.includes('overdue');
    const isDueToday = text === 'Due today';

    if (text === null) {
        return <span className="text-muted-foreground">Loading...</span>;
    }

    return (
        <div className={cn(
            "text-sm font-semibold whitespace-nowrap",
            isOverdue ? "text-destructive" : "text-muted-foreground",
            isDueToday && "font-extrabold text-foreground"
        )}>
            {text}
        </div>
    );
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

  const myTasks = useMemo(() => {
    return allTasks
      .filter(
        (task) =>
          task.assignee.name === "Jane Doe" && task.status !== "Done"
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
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
  
    const calendarEvents = useMemo(() => {
        const taskEvents = allTasks.map(task => ({
            id: `task-${task.id}`,
            date: task.dueDate,
            title: `Task Due: ${task.name}`,
            type: 'task',
            link: `/dashboard/tasks`
        }));
        const invoiceEvents = invoices.map(invoice => ({
            id: `invoice-${invoice.id}`,
            date: invoice.dueDate,
            title: `Invoice Due: ${invoice.id.toUpperCase()}`,
            type: 'invoice',
            link: `/dashboard/invoices`
        }));
        return [...taskEvents, ...invoiceEvents];
    }, []);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        return calendarEvents.filter(event => 
            event.date.getDate() === selectedDate.getDate() &&
            event.date.getMonth() === selectedDate.getMonth() &&
            event.date.getFullYear() === selectedDate.getFullYear()
        );
    }, [selectedDate, calendarEvents]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane!</h1>
          <p className="text-muted-foreground">Here's your command center for today.</p>
        </div>
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
              Invoices and estimates
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus /> Add a Client</CardTitle>
            <CardDescription>Start a new relationship by adding a client profile.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/dashboard/clients">New Client</Link>
            </Button>
          </CardFooter>
        </Card>
         <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt /> Get Paid</CardTitle>
            <CardDescription>Create a professional invoice and get paid faster.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/dashboard/invoices">Create Invoice</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSignature /> Secure a New Deal</CardTitle>
            <CardDescription>Send a detailed estimate or quote to win your next project.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/dashboard/estimates">Create Estimate</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark /> Track Spending</CardTitle>
            <CardDescription>Log expenses to keep your project budgets on track.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
             <Button asChild className="w-full">
                <Link href="/dashboard/expenses">Add Expense</Link>
            </Button>
          </CardFooter>
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
                                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
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
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Unified Calendar</CardTitle>
                <CardDescription>Upcoming deadlines for tasks and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                    <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border p-0"
                        modifiers={{
                            events: calendarEvents.map(e => e.date)
                        }}
                        modifiersClassNames={{
                            events: "bg-primary/20 text-primary rounded-full"
                        }}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                        Events for {selectedDate ? selectedDate.toLocaleDateString() : '...'}
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => (
                        <Link href={event.link} key={event.id}>
                            <div className={cn(
                                "p-2 rounded-md text-sm cursor-pointer hover:bg-muted/50",
                                event.type === 'task' ? 'border-l-4 border-accent' : 'border-l-4 border-chart-3'
                            )}>
                                {event.title}
                            </div>
                        </Link>
                    )) : (
                        <p className="text-sm text-muted-foreground">No events for this day.</p>
                    )}
                    </div>
                </div>
            </CardContent>
          </Card>
          <ResourceAllocationChart data={resourceAllocation} />
          <Card>
            <CardHeader>
                <CardTitle>My Tasks Due Soon</CardTitle>
                <CardDescription>Top 5 tasks assigned to you across all projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {myTasks.map((task) => (
                         <div key={task.id} className="flex items-center">
                           <div className="flex-1">
                             <p className="text-sm font-medium">{task.name}</p>
                             <Link href={`/dashboard/projects/${task.projectId}`} className="text-xs text-muted-foreground hover:underline">
                                {projects.find(p => p.id === task.projectId)?.name}
                             </Link>
                           </div>
                           <MyTaskDueDate dueDate={task.dueDate} />
                         </div>
                       )
                    )}
                    {myTasks.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No upcoming tasks assigned to you.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <QuickAddButton />
    </div>
  );
}
