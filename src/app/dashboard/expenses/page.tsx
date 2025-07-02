import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function ExpensesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>This page will be used for tracking expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <DollarSign className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Expense tracking feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
