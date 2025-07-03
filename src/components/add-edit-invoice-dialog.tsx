
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription as FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Invoice, Client, Project } from "@/lib/data";
import { useEffect } from "react";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client."),
  projectId: z.string().min(1, "Please select a project."),
  amount: z.coerce.number().min(0, "Amount must be a positive number."),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue", "Partial"]),
  issueDate: z.date(),
  dueDate: z.date(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["days", "weeks", "months"]).optional(),
  recurringPeriod: z.coerce.number().min(1).optional(),
}).refine(data => data.dueDate >= data.issueDate, {
  message: "Due date cannot be before issue date.",
  path: ["dueDate"],
}).superRefine((data, ctx) => {
  if (data.isRecurring) {
    if (!data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurringInterval"],
        message: "Interval is required for recurring invoices.",
      });
    }
    if (!data.recurringPeriod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurringPeriod"],
        message: "Period is required for recurring invoices.",
      });
    }
  }
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface AddEditInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: InvoiceFormValues, invoiceId?: string) => void;
  invoice?: Invoice | null;
  clients: Client[];
  projects: Project[];
}

export function AddEditInvoiceDialog({
  open,
  onOpenChange,
  onSave,
  invoice,
  clients,
  projects,
}: AddEditInvoiceDialogProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      projectId: "",
      amount: 0,
      status: "Draft",
      isRecurring: false,
      recurringInterval: "days",
      recurringPeriod: 30,
    },
  });

  useEffect(() => {
    if (open) {
      if (invoice) {
        form.reset({
          clientId: invoice.clientId,
          projectId: invoice.projectId,
          amount: invoice.amount,
          status: invoice.status,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          isRecurring: invoice.isRecurring ?? false,
          recurringInterval: invoice.recurringInterval ?? 'days',
          recurringPeriod: invoice.recurringPeriod,
        });
      } else {
        form.reset({
          clientId: "",
          projectId: "",
          amount: 0,
          status: "Draft",
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          isRecurring: false,
          recurringInterval: 'days',
          recurringPeriod: 30,
        });
      }
    }
  }, [invoice, open, form]);

  const onSubmit = (data: InvoiceFormValues) => {
    onSave(data, invoice?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Add New Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Make changes to your invoice here." : "Fill in the details for the new invoice."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <Separator />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Make Recurring</FormLabel>
                    <FormDescription>
                      Automatically create and send this invoice on a schedule.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch("isRecurring") && (
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="recurringPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat Every</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recurringInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}


            <DialogFooter className="pt-4">
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit">Save Invoice</Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
