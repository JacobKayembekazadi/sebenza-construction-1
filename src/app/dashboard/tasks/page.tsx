import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function TasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
        <CardDescription>This page will contain a comprehensive list of all tasks across all projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <Briefcase className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Task management feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
