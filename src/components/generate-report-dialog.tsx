"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateFinancialReportOutput } from "@/ai/flows/generate-financial-report";
import { useToast } from "@/hooks/use-toast";

const reportSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: string;
  onGenerate: (startDate: Date, endDate: Date) => Promise<GenerateFinancialReportOutput>;
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  reportType,
  onGenerate,
}: GenerateReportDialogProps) {
  const [report, setReport] = useState<GenerateFinancialReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      endDate: new Date(),
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset state when closing
      form.reset({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        endDate: new Date(),
      });
      setReport(null);
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await onGenerate(data.startDate, data.endDate);
      setReport(result);
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate the financial report. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate {reportType} Report</DialogTitle>
          <DialogDescription>
            Select a date range to generate the report. The AI will analyze your financial data.
          </DialogDescription>
        </DialogHeader>
        
        {!report && !isLoading && (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                 <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 </div>
                 <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Report
                    </Button>
                 </DialogFooter>
            </form>
            </Form>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your data, please wait...</p>
            </div>
        )}

        {report && (
            <div className="max-w-none text-sm space-y-4">
                <h2 className="text-xl font-bold">{report.title}</h2>
                <p className="text-muted-foreground">{report.period}</p>
                <div className="grid grid-cols-3 gap-4 my-6 p-4 border rounded-lg bg-muted/50">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">${report.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                     <div className="text-center">
                        <p className="text-lg font-semibold text-destructive">${report.totalExpenses.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Expenses</p>
                    </div>
                     <div className="text-center">
                        <p className="text-xl font-bold">${report.netProfit.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Net Profit/Loss</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">{report.summary}</p>
                </div>
                
                <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {report.recommendations.split('\n').map((rec, i) => {
                           const cleanedRec = rec.trim().replace(/^(•|-|\*)\s*/, '');
                           return cleanedRec ? <li key={i}>{cleanedRec}</li> : null;
                        })}
                    </ul>
                </div>

                <DialogFooter className="pt-6">
                    <Button variant="outline" disabled><FileDown className="mr-2"/>Export as PDF</Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
