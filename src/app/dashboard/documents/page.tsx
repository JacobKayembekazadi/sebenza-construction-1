import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileBox } from "lucide-react";

export default function DocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>This page will be used for managing project documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <FileBox className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Document management feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
