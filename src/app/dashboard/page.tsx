
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
import { 
    projects as initialProjects, 
    allTasks as initialTasks, 
    financialData as initialFinancialData, 
    recentActivity, 
    resourceAllocation, 
    weatherForecast, 
    invoices as initialInvoices, 
    estimates as initialEstimates, 
    expenses as initialExpenses,
    allEvents as initialEvents,
    clients,
    employees,
    services,
    newsUpdates, 
    type Task, 
    type Project,
    type Invoice,
    type Expense,
    type Estimate,
    type CustomEvent,
    type UnifiedEvent
} from "@/lib/data";
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
  Users,
  Edit,
  Trash2,
  GanttChartSquare,
  DollarSign,
  FileText
} from "lucide-react";
import { FinancialSnapshotChart } from "@/components/dashboard/financial-snapshot-chart";
import { cn } from "@/lib/utils";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { ResourceAllocationChart } from "@/components/dashboard/resource-allocation-chart";
import { WeatherForecast } from "@/components/dashboard/weather-forecast";
import { NewsAndUpdates } from "@/components/dashboard/news-and-updates";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { format, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AddEditProjectDialog, type ProjectFormValues } from "@/components/add-edit-project-dialog";
import { AddEditTaskDialog, type TaskFormValues } from "@/components/add-edit-task-dialog";
import { AddEditInvoiceDialog, type InvoiceFormValues } from "@/components/add-edit-invoice-dialog";
import { AddEditExpenseDialog, type ExpenseFormValues } from "@/components/add-edit-expense-dialog";
import { AddEditEventDialog, type EventFormValues } from "@/components/add-edit-event-dialog";
import { DeleteEventDialog } from "@/components/delete-event-dialog";

const eventTypeConfig = {
  project: { icon: Briefcase, color: "border-chart-3", label: "Job Deadline" },
  task: { icon: ListChecks, color: "border-chart-1", label: "Task Due" },
  invoice: { icon: Receipt, color: "border-chart-2", label: "Invoice Due" },
  custom: { icon: Users, color: "border-chart-4", label: "Meeting" },
};

export default function DashboardPage() {
    const { toast } = useToast();

    // Data states
    const [projects, setProjects] = useState(initialProjects);
    const [tasks, setTasks] = useState(initialTasks);
    const [invoices, setInvoices] = useState(initialInvoices);
    const [estimates, setEstimates] = useState(initialEstimates);
    const [expenses, setExpenses] = useState(initialExpenses);
    const [events, setEvents] = useState<UnifiedEvent[]>(initialEvents);
    const [financialData, setFinancialData] = useState(initialFinancialData);
    
    // Dialog states
    const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
    const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
    const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
    const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CustomEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<CustomEvent | null>(null);

    // Save Handlers
    const handleSaveProject = (data: ProjectFormValues) => {
        const client = clients.find(c => c.id === data.clientId);
        if (!client) return;
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            completion: 0,
            spent: 0,
            tasks: [],
            team: [],
            documents: [],
            clientName: client.name,
            ...data,
        };
        setProjects(prev => [newProject, ...prev]);
        toast({ title: "Job Created", description: `New job "${newProject.name}" has been created.` });
    };

    const handleSaveTask = (data: TaskFormValues) => {
        const assignee = employees.find(e => e.name === data.assigneeName);
        if (!assignee) return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            dependencies: [],
            ...data,
            assignee,
        };
        setTasks(prev => [newTask, ...prev]);
        toast({ title: "Task Created", description: `New task "${newTask.name}" has been created.` });
    };

    const handleSaveInvoice = (data: InvoiceFormValues) => {
        const client = clients.find(c => c.id === data.clientId);
        const project = projects.find(p => p.id === data.projectId);
        if (!client || !project) return;
        
        const subtotal = data.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const total = subtotal * (1 + data.tax / 100) - data.discount;

        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            clientName: client.name,
            projectName: project.name,
            subtotal,
            total,
            lineItems: data.lineItems.map((li, index) => ({...li, id: `li-inv-${Date.now()}-${index}`, total: li.quantity * li.unitPrice})),
            ...data,
        };
        setInvoices(prev => [newInvoice, ...prev]);
        toast({ title: "Invoice Created", description: `New invoice ${newInvoice.id.toUpperCase()} has been created.` });
    };

    const handleSaveExpense = (data: ExpenseFormValues) => {
        const project = projects.find(p => p.id === data.projectId);
        if (!project) return;
        const newExpense: Expense = {
            id: `exp-${Date.now()}`,
            projectName: project.name,
            receiptUrl: '',
            ...data,
        };
        setExpenses(prev => [newExpense, ...prev]);
        toast({ title: "Expense Created", description: `New expense "${newExpense.description}" has been created.` });
    };

    // Calendar event handlers
    const handleOpenAddDialog = () => {
        setEventToEdit(null);
        setIsAddEditDialogOpen(true);
    };

    const handleOpenEditDialog = (event: UnifiedEvent) => {
        if (event.type === 'custom' && event.raw) {
            setEventToEdit(event.raw as CustomEvent);
            setIsAddEditDialogOpen(true);
        }
    };

    const handleOpenDeleteDialog = (event: UnifiedEvent) => {
        if (event.type === 'custom' && event.raw) {
            setEventToDelete(event.raw as CustomEvent);
            setIsDeleteDialogOpen(true);
        }
    };
    
    const handleSaveEvent = (data: EventFormValues, eventId?: string) => {
        if (eventId) {
            const updatedEvents = events.map(e => {
                if (e.id === eventId && e.type === 'custom') {
                    return { ...e, title: data.title, date: data.startDate, raw: { ...e.raw, ...data, startDate: data.startDate, endDate: data.endDate }};
                }
                return e;
            });
            setEvents(updatedEvents);
            toast({ title: "Event Updated" });
        } else {
            const newEvent: CustomEvent = { id: `custom-${Date.now()}`, type: 'custom', ...data };
            const newUnifiedEvent: UnifiedEvent = { id: newEvent.id, title: newEvent.title, date: newEvent.startDate, type: 'custom', isCustom: true, raw: newEvent };
            setEvents([...events, newUnifiedEvent]);
            toast({ title: "Event Created" });
        }
    };
    
    const handleDeleteEvent = () => {
        if (eventToDelete) {
            setEvents(events.filter(e => e.id !== eventToDelete.id));
            toast({ title: "Event Deleted", variant: "destructive" });
            setIsDeleteDialogOpen(false);
            setEventToDelete(null);
        }
    };

    // Memoized Calculations
    const financialSummary = useMemo(() => {
        const totalIncome = financialData.reduce((acc, item) => acc + item.revenue, 0);
        const totalExpenses = financialData.reduce((acc, item) => acc + item.expenses, 0);
        const totalProfit = totalIncome - totalExpenses;
        const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((acc, i) => acc + i.total, 0);
        const outstandingEstimates = estimates.filter(e => e.status === 'Sent').reduce((acc, e) => acc + e.total, 0);
        return { totalIncome, totalExpenses, totalProfit, totalOutstanding: outstandingInvoices + outstandingEstimates, unbilledHours: 42 };
    }, [financialData, invoices, estimates]);

    const attentionProjects = useMemo(() => projects.filter(p => p.status === "At Risk" || p.status === "Off Track"), [projects]);
  
    const statusVariant = (status: string): 'green' | 'yellow' | 'destructive' | 'outline' => {
        switch (status) {
            case "On Track": return "green";
            case "At Risk": return "yellow";
            case "Off Track": return "destructive";
            default: return "outline";
        }
    };
  
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(event => isSameDay(event.date, selectedDate)).sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [selectedDate, events]);

    const calendarModifiers = useMemo(() => {
        return {
            project: events.filter(e => e.type === 'project').map(e => e.date),
            task: events.filter(e => e.type === 'task').map(e => e.date),
            invoice: events.filter(e => e.type === 'invoice').map(e => e.date),
            custom: events.filter(e => e.type === 'custom').map(e => e.date),
        };
    }, [events]);

  return (
    <>
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
                    <AlertTriangle className="text-yellow-500" />
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
          <Card>
              <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => setIsAddProjectDialogOpen(true)}><GanttChartSquare className="mr-2 h-4 w-4"/>New Job</Button>
                  <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(true)}><ListChecks className="mr-2 h-4 w-4"/>New Task</Button>
                  <Button variant="outline" onClick={() => setIsAddInvoiceDialogOpen(true)}><Receipt className="mr-2 h-4 w-4"/>New Invoice</Button>
                  <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(true)}><DollarSign className="mr-2 h-4 w-4"/>New Expense</Button>
              </CardContent>
          </Card>
          <NewsAndUpdates updates={newsUpdates} />
          <WeatherForecast forecasts={weatherForecast} />
           <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> Unified Calendar</CardTitle>
                            <CardDescription>Deadlines for jobs, tasks, and events.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={handleOpenAddDialog}>
                           <Plus className="h-4 w-4" />
                           <span className="sr-only">New Event</span>
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
                        project: "border-chart-3 border-2",
                        task: "border-chart-1 border-2",
                        invoice: "border-chart-2 border-2",
                        custom: "border-chart-4 border-2",
                    }}
                />
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">
                            Events for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                        </h3>
                         <Button variant="link" asChild className="p-0 h-auto">
                           <Link href="/dashboard/calendar">
                             View Full Calendar &rarr;
                           </Link>
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => {
                       const config = eventTypeConfig[event.type];
                       const Icon = config.icon;
                       return (
                        <div key={event.id} className={cn("p-2 rounded-md text-sm border-l-4 flex items-start justify-between", config.color)}>
                            <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{config.label}</p>
                                    {event.link && (
                                        <Link href={event.link} className="text-xs text-primary hover:underline">
                                            View Details &rarr;
                                        </Link>
                                    )}
                                </div>
                            </div>
                            {event.isCustom && (
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(event)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(event)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">No events for this day.</p>
                    )}
                    </div>
                </div>
            </CardContent>
          </Card>
          <ResourceAllocationChart data={resourceAllocation} />
        </div>
      </div>
    </div>
    
    {/* Dialogs for Quick Actions */}
    <AddEditProjectDialog
        open={isAddProjectDialogOpen}
        onOpenChange={setIsAddProjectDialogOpen}
        onSave={handleSaveProject}
        clients={clients}
    />
    <AddEditTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onSave={handleSaveTask}
        projects={projects}
        employees={employees}
    />
    <AddEditInvoiceDialog
        open={isAddInvoiceDialogOpen}
        onOpenChange={setIsAddInvoiceDialogOpen}
        onSave={handleSaveInvoice}
        invoice={null}
        clients={clients}
        projects={projects}
        services={services}
    />
    <AddEditExpenseDialog
        open={isAddExpenseDialogOpen}
        onOpenChange={setIsAddExpenseDialogOpen}
        onSave={handleSaveExpense}
        projects={projects}
    />

    {/* Dialogs for Calendar Events */}
    <AddEditEventDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveEvent}
        event={eventToEdit}
    />
    <DeleteEventDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteEvent}
        event={eventToDelete}
    />
    </>
  );
}
