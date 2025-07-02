import { projects } from "@/lib/data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GanttChart } from "@/components/gantt-chart";
import { TaskList } from "@/components/task-list";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }
  
  const statusVariant = (status: string) => {
    switch (status) {
      case "On Track": return "default";
      case "At Risk": return "secondary";
      case "Off Track": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">Managed by {project.manager}</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={statusVariant(project.status)} className="text-sm">{project.status}</Badge>
            <AddTaskDialog />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{project.completion}%</div>
            <Progress value={project.completion} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
            </div>
            <Progress value={(project.spent / project.budget) * 100} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>
                <strong>Start:</strong> {project.startDate.toLocaleDateString()}
              </p>
              <p>
                <strong>End:</strong> {project.endDate.toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <GanttChart tasks={project.tasks} />
      </div>

      <div>
        <TaskList tasks={project.tasks} />
      </div>
    </div>
  );
}
