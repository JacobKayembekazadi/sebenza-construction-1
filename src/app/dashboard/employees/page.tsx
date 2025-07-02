import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function EmployeesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Management</CardTitle>
        <CardDescription>This page will be used for managing employees.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <Users className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Employee management feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
