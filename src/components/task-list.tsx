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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Task } from "@/lib/data";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
    const statusVariant = (status: string) => {
        switch (status) {
            case "Done": return "default";
            case "In Progress": return "secondary";
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
            <TableCell>{task.dueDate.toLocaleDateString()}</TableCell>
            <TableCell>
            <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
            </TableCell>
        </TableRow>
        ))}
    </TableBody>
    </Table>
  );
}
