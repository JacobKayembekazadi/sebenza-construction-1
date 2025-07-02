import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects, allTasks } from "@/lib/data";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  ListChecks,
  Sparkles,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { cn } from "@/lib/utils";
import { generateDailyBriefing } from "@/ai/flows/generate-daily-briefing";
import React from "react";

function BriefingSkeleton() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Your Daily AI Briefing
        </CardTitle>
        <CardDescription>Generating your personalized summary...</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-4 w-full bg-muted rounded-md animate-pulse mt-4"></div>
          <div className="h-4 w-10/12 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-4 w-full bg-muted rounded-md animate-pulse mt-4"></div>
          <div className="h-4 w-10/12 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-4 w-full bg-muted rounded-md animate-pulse mt-4"></div>
          <div className="h-4 w-10/12 bg-muted rounded-md animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

async function DailyAiBriefing() {
  const briefing = await generateDailyBriefing({
    userName: "Jane Doe",
    projects,
    tasks: allTasks,
  }).catch(err => {
    console.error("Failed to generate daily briefing:", err);
    return null;
  });

  if (!briefing) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Your Daily AI Briefing
        </CardTitle>
        <CardDescription>{briefing.greeting}</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Lightbulb className="text-accent" />
            Key Priorities
          </h3>
          <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
            {briefing.keyPriorities.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <AlertTriangle className="text-destructive" />
            Potential Risks
          </h3>
          <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
             {briefing.potentialRisks.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <TrendingUp className="text-green-500" />
            Positive Updates
          </h3>
           <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
            {briefing.positiveUpdates.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const projectsAtRisk = projects.filter(
    (p) => p.status === "At Risk" || p.status === "Off Track"
  ).length;
  
  const overdueTasks = allTasks.filter(
    (task) => task.dueDate < new Date() && task.status !== "Done"
  ).length;

  const myTasks = allTasks
    .filter(
      (task) =>
        task.assignee.name === "Jane Doe" && task.status !== "Done"
    )
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

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

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane!</h1>
          <p className="text-muted-foreground">Here's your project overview for today.</p>
        </div>
      </div>
      
      <React.Suspense fallback={<BriefingSkeleton />}>
        <DailyAiBriefing />
      </React.Suspense>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Total projects currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsAtRisk}</div>
            <p className="text-xs text-muted-foreground">
              Projects that are 'At Risk' or 'Off Track'
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Across all active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
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
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <ProjectStatusChart projects={projects} />
          <Card>
            <CardHeader>
                <CardTitle>My Upcoming Tasks</CardTitle>
                <CardDescription>Top 5 tasks assigned to you across all projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {myTasks.map((task) => {
                       const daysRemaining = getDaysRemaining(task.dueDate);
                       const isOverdue = daysRemaining < 0;
                       
                       let dueDateText: string;
                       if (isOverdue) {
                           dueDateText = `${Math.abs(daysRemaining)}d overdue`;
                       } else if (daysRemaining === 0) {
                           dueDateText = 'Due today';
                       } else {
                           dueDateText = `in ${daysRemaining}d`;
                       }

                       return (
                         <div key={task.id} className="flex items-center">
                           <div className="flex-1">
                             <p className="text-sm font-medium">{task.name}</p>
                             <Link href={`/dashboard/projects/${task.projectId}`} className="text-xs text-muted-foreground hover:underline">
                                {projects.find(p => p.id === task.projectId)?.name}
                             </Link>
                           </div>
                           <div className={cn(
                               "text-sm font-semibold whitespace-nowrap",
                               isOverdue ? "text-destructive" : "text-muted-foreground",
                               daysRemaining === 0 && "font-extrabold text-foreground"
                           )}>
                             {dueDateText}
                           </div>
                         </div>
                       );
                    })}
                    {myTasks.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No upcoming tasks assigned to you.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
