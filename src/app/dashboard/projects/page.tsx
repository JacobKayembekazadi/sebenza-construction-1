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
import { projects, allTasks } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Search,
  GanttChartSquare,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");

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
  }, [searchTerm, statusFilter, managerFilter]);

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
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Your central hub for monitoring and managing all projects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
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
              Projects At Risk
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
            <CardTitle>Project Directory</CardTitle>
            <CardDescription>
              Search, filter, and manage all ongoing construction projects.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
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
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Project Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Budget Usage</TableHead>
                <TableHead>End Date</TableHead>
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
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
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
                    <TableCell>
                      {project.endDate.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No projects found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
