import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function InvoicesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>This page will be used for managing invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <Receipt className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Invoices feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
