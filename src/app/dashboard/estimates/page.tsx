import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function EstimatesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
        <CardDescription>This page will be used for creating and managing project estimates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <FileText className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Estimates feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
