
'use client';

import { useState } from "react";
import { projects as initialProjects, employees, type Task, type Project } from "@/lib/data";
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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddEditTaskDialog, type TaskFormValues } from "@/components/add-edit-task-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, PiggyBank, FolderArchive } from "lucide-react";
import { format } from "date-fns";

// A helper function to find project, could be in a lib file
const findProject = (id: string): Project | undefined => {
    // In a real app, this would be an API call.
    // For now, we find it in the mock data.
    return initialProjects.find((p) => p.id === id);
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  // We use state for the project to make it reactive to changes
  const [project] = useState(() => findProject(params.id));
  const [tasks, setTasks] = useState<Task[]>(project?.tasks || []);
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!project) {
    notFound();
  }

  const handleOpenAddDialog = () => {
    setSelectedTask(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (task: Task) => {
    setSelectedTask(task);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveTask = (data: TaskFormValues, taskId?: string) => {
    const assignee = employees.find(e => e.name === data.assigneeName);
    if (!assignee) return;

    if (taskId) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...data, assignee } : t));
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        dependencies: [],
        ...data,
        assignee,
      };
      setTasks([newTask, ...tasks]);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
    }
  };
  
  const statusVariant = (status: string): 'green' | 'yellow' | 'destructive' | 'outline' => {
    switch (status) {
      case "On Track": return "green";
      case "At Risk": return "yellow";
      case "Off Track": return "destructive";
      default: return "outline";
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Managed by {project.manager}</p>
              <Badge variant={statusVariant(project.status)} className="text-sm">{project.status}</Badge>
            </div>
            <p className="mt-4 text-muted-foreground max-w-3xl">{project.description}</p>
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
                ${project.spent.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                of ${project.budget.toLocaleString()}
              </p>
              <Progress value={(project.spent / project.budget) * 100} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Start:</strong> {format(project.startDate, "PPP")}
                </p>
                <p>
                  <strong>End:</strong> {format(project.endDate, "PPP")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 gap-1 sm:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Project Timeline</CardTitle>
                      <CardDescription>A visual timeline of all project tasks.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <GanttChart tasks={tasks} />
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                          <CardTitle>Tasks</CardTitle>
                          <CardDescription>All tasks associated with this project.</CardDescription>
                      </div>
                      <Button onClick={handleOpenAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Task
                      </Button>
                  </CardHeader>
                  <CardContent>
                      <TaskList tasks={tasks} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Budget Details</CardTitle>
                      <CardDescription>Detailed financial tracking for this project.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                          <PiggyBank className="w-16 h-16 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">Detailed budget tracking feature coming soon.</p>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          
          <TabsContent value="team" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Project Team</CardTitle>
                      <CardDescription>Manage team members assigned to this project.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                          <Users2 className="w-16 h-16 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">Team management feature coming soon.</p>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>All documents and files for this project.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                          <FolderArchive className="w-16 h-16 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">Document management feature coming soon.</p>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
      <AddEditTaskDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        projects={initialProjects}
        employees={employees}
        defaultProjectId={project.id}
      />
      
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTask}
        task={selectedTask}
      />
    </>
  );
}
