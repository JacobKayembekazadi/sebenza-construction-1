
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
  FormDescription,
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
import { CalendarIcon, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Expense, Project } from "@/lib/data";
import { useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

const expenseSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  amount: z.coerce.number().min(0, "Amount must be a positive number."),
  category: z.enum(["Materials", "Labor", "Permits", "Subcontractor", "Other"]),
  date: z.date(),
  projectId: z.string().min(1, "Please select a project."),
  isBillable: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddEditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ExpenseFormValues, expenseId?: string) => void;
  expense?: Expense | null;
  projects: Project[];
}

export function AddEditExpenseDialog({
  open,
  onOpenChange,
  onSave,
  expense,
  projects,
}: AddEditExpenseDialogProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "Other",
      date: new Date(),
      projectId: "",
      isBillable: false,
      isRecurring: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        form.reset({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: new Date(expense.date),
          projectId: expense.projectId,
          isBillable: expense.isBillable,
          isRecurring: expense.isRecurring,
        });
      } else {
        form.reset({
          description: "",
          amount: 0,
          category: "Other",
          date: new Date(),
          projectId: "",
          isBillable: false,
          isRecurring: false,
        });
      }
    }
  }, [expense, open, form]);

  const onSubmit = (data: ExpenseFormValues) => {
    onSave(data, expense?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {expense ? "Make changes to your expense here." : "Fill in the details for the new expense."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Purchase of 2-ton steel beams" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 25000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Permits">Permits</SelectItem>
                        <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
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
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Date of Expense</FormLabel>
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
            
            <Separator />

             <FormField
              control={form.control}
              name="isBillable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Billable Expense</FormLabel>
                    <FormDescription>
                      This can be billed to the client.
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

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Expense</FormLabel>
                    <FormDescription>
                      This expense recurs monthly.
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

            <DialogFooter className="pt-4 sm:justify-between">
              <Button type="button" variant="outline" className="w-full sm:w-auto" disabled>
                <Paperclip className="mr-2 h-4 w-4" />
                Attach Receipt
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Expense</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
