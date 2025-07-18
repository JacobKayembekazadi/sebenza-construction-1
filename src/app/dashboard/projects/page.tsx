
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { projects as initialProjects, allTasks, clients, type Project, type Client } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  GanttChartSquare,
  CircleDollarSign,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { type ProjectFormValues, AddEditProjectDialog } from "@/components/add-edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { format } from "date-fns";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const managers = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.manager))),
  ];
  const statuses = ["All", "On Track", "At Risk", "Off Track"];

  const filteredProjects = useMemo(() => {
    return projects
      .map((project) => {
        const overdue = allTasks.filter(
          (task) =>
            task.projectId === project.id &&
            task.dueDate < new Date() &&
            task.status !== "Done"
        ).length;
        return { ...project, overdueTasks: overdue };
      })
      .filter((project) => {
        const matchesSearch = project.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || project.status === statusFilter;
        const matchesManager =
          managerFilter === "All" || project.manager === managerFilter;
        return matchesSearch && matchesStatus && matchesManager;
      });
  }, [projects, searchTerm, statusFilter, managerFilter]);

  const statusVariant = (status: string): 'green' | 'yellow' | 'destructive' | 'outline' => {
    switch (status) {
      case "On Track":
        return "green";
      case "At Risk":
        return "yellow";
      case "Off Track":
        return "destructive";
      default:
        return "outline";
    }
  };

  const summary = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const projectsAtRisk = projects.filter(
      (p) => p.status === "At Risk" || p.status === "Off Track"
    ).length;
    return {
      totalProjects: projects.length,
      totalBudget,
      totalSpent,
      projectsAtRisk,
    };
  }, [projects]);

  const handleOpenAddDialog = () => {
    setSelectedProject(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (project: Project) => {
    setSelectedProject(project);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveProject = (data: ProjectFormValues, projectId?: string) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;
    
    if (projectId) {
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...data, clientName: client.name } : p));
    } else {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        completion: 0,
        spent: 0,
        tasks: [],
        clientName: client.name,
        ...data,
      };
      setProjects([newProject, ...projects]);
    }
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Your central hub for monitoring and managing all jobs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jobs
            </CardTitle>
            <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Across the entire portfolio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Budget
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary.totalSpent / 1000000).toFixed(1)}M / $
              {(summary.totalBudget / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Total budget utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs At Risk
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.projectsAtRisk}</div>
            <p className="text-xs text-muted-foreground">
              &apos;At Risk&apos; or &apos;Off Track&apos;
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Job Directory</CardTitle>
            <CardDescription>
              Search, filter, and manage all ongoing construction jobs.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Job Name</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead className="hidden lg:table-cell">Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Overdue</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead className="hidden lg:table-cell">Budget Usage</TableHead>
                <TableHead className="hidden lg:table-cell">End Date</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{project.clientName}</TableCell>
                    <TableCell className="hidden lg:table-cell">{project.manager}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={
                          project.overdueTasks > 0
                            ? "text-destructive font-bold"
                            : "text-muted-foreground"
                        }
                      >
                        {project.overdueTasks}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-8 text-right">
                          {project.completion}%
                        </span>
                        <Progress
                          value={project.completion}
                          className="flex-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-8 text-right">
                          {((project.spent / project.budget) * 100).toFixed(0)}
                          %
                        </span>
                        <Progress
                          value={(project.spent / project.budget) * 100}
                          className="flex-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {format(project.endDate, "PPP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(project)}>
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(project)} className="text-destructive focus:bg-destructive/20">
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No jobs found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddEditProjectDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveProject}
        project={selectedProject}
        clients={clients}
      />
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProject}
        project={selectedProject}
      />
    </div>
  );
}
