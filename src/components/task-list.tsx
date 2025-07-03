
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Task } from "@/lib/data";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
    const statusVariant = (status: Task['status']): 'green' | 'yellow' | 'outline' => {
        switch (status) {
            case "Done": return "green";
            case "In Progress": return "yellow";
            case "To Do": return "outline";
            default: return "outline";
        }
    };

    if (tasks.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 text-muted-foreground border-2 border-dashed rounded-lg">
          This project has no tasks yet.
        </div>
      )
    }
    
  return (
    <Table>
    <TableHeader>
        <TableRow>
        <TableHead>Task</TableHead>
        <TableHead>Assignee</TableHead>
        <TableHead>Due Date</TableHead>
        <TableHead>Status</TableHead>
        {(onEdit || onDelete) && <TableHead className="w-[50px] text-right">Actions</TableHead>}
        </TableRow>
    </TableHeader>
    <TableBody>
        {tasks.map((task) => (
        <TableRow key={task.id}>
            <TableCell className="font-medium">{task.name}</TableCell>
            <TableCell>
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint="employee avatar" />
                <AvatarFallback>{task.assignee.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span>{task.assignee.name}</span>
            </div>
            </TableCell>
            <TableCell>{format(task.dueDate, "PPP")}</TableCell>
            <TableCell>
            <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
            </TableCell>
            {(onEdit || onDelete) && (
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && <DropdownMenuItem onClick={() => onEdit(task)}>Edit Task</DropdownMenuItem>}
                    {onDelete && <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive focus:bg-destructive/20">Delete Task</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
        </TableRow>
        ))}
    </TableBody>
    </Table>
  );
}
