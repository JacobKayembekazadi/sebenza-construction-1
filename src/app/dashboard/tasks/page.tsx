
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { allTasks as initialTasks, projects, employees, type Task } from "@/lib/data";
import Link from "next/link";
import { Search, MoreHorizontal, PlusCircle, ArrowDown, ArrowUp, ChevronsUpDown, AlertCircle, Equal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { AddEditTaskDialog, type TaskFormValues } from "@/components/add-edit-task-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";

type SortableColumn = keyof Task | 'projectName';

type SortConfig = {
  key: SortableColumn;
  direction: "ascending" | "descending";
} | null;

const priorityIcons = {
    "Urgent": <AlertCircle className="h-5 w-5 text-destructive" />,
    "High": <ArrowUp className="h-5 w-5 text-accent" />,
    "Medium": <Equal className="h-5 w-5 text-blue-500" />,
    "Low": <ArrowDown className="h-5 w-5 text-muted-foreground" />,
};

const prioritySortOrder: Record<Task['priority'], number> = {
  "Urgent": 4,
  "High": 3,
  "Medium": 2,
  "Low": 1,
};

const DueDateDisplay = ({ dueDate, status }: { dueDate: Date, status: Task['status'] }) => {
    const [text, setText] = useState<React.ReactNode>(() => format(dueDate, "PPP"));

    useEffect(() => {
        if (status === 'Done') {
            setText(<span className="text-muted-foreground">Completed</span>);
            return;
        }

        const now = new Date();
        const isOverdue = dueDate < now;
        const distance = formatDistanceToNow(dueDate, { addSuffix: true });

        setText(
            <span className={cn(isOverdue ? "text-destructive font-semibold" : "text-muted-foreground")}>
                {isOverdue ? `Overdue (${distance.replace('about ', '')})` : `Due ${distance}`}
            </span>
        );
    }, [dueDate, status]);

    return text;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const projectOptions = ["All", ...projects.map((p) => p.name)];
  const statusOptions = ["All", "To Do", "In Progress", "Done"];
  const assigneeOptions = ["All", ...employees.map((e) => e.name)];
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), []);

  const sortedAndFilteredTasks = useMemo(() => {
    let filtered = tasks
      .map(task => ({
          ...task,
          projectName: projectMap.get(task.projectId) || "N/A"
      }))
      .filter((task) => {
        const matchesSearch = task.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || task.status === statusFilter;
        const matchesProject =
          projectFilter === "All" || task.projectName === projectFilter;
        const matchesAssignee =
          assigneeFilter === 'All' || task.assignee.name === assigneeFilter;
        return matchesSearch && matchesStatus && matchesProject && matchesAssignee;
      });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'priority') {
          aValue = prioritySortOrder[a.priority];
          bValue = prioritySortOrder[b.priority];
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchTerm, statusFilter, projectFilter, assigneeFilter, sortConfig, projectMap]);

  const requestSort = (key: SortableColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };


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

  const statusVariant = (status: Task['status']) => {
    switch (status) {
      case "Done":
        return "default";
      case "In Progress":
        return "secondary";
      case "To Do":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          View, search, and filter all tasks across your projects.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>
              A comprehensive list of every task in your portfolio.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8 w-full sm:w-auto lg:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project === "All" ? "All Projects" : project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                {assigneeOptions.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee === "All" ? "All Assignees" : assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                   <Button variant="ghost" onClick={() => requestSort('name')} className="px-0">
                    Task
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                   <Button variant="ghost" onClick={() => requestSort('projectName')} className="px-0">
                    Project
                    {getSortIcon('projectName')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('assignee')} className="px-0">
                    Assignee
                    {getSortIcon('assignee')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('dueDate')} className="px-0">
                    Due Date
                    {getSortIcon('dueDate')}
                  </Button>
                </TableHead>
                 <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('priority')} className="px-0">
                    Priority
                    {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredTasks.length > 0 ? (
                sortedAndFilteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/projects/${task.projectId}`}
                        className="hover:underline text-muted-foreground"
                      >
                        {task.projectName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint="employee avatar" />
                            <AvatarFallback>{task.assignee.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>{task.assignee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DueDateDisplay dueDate={task.dueDate} status={task.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" title={task.priority}>
                        {priorityIcons[task.priority]}
                        <span className="sr-only">{task.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(task.status)}>
                        {task.status}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(task)}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(task)} className="text-destructive focus:bg-destructive/20">
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tasks found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddEditTaskDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        projects={projects}
        employees={employees}
      />
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTask}
        task={selectedTask}
      />
    </div>
  );
}
