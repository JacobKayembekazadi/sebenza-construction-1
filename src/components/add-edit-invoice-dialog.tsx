
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { CalendarIcon, Paperclip, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Invoice, Client, Project, Service } from "@/lib/data";
import { useEffect, useMemo, useState } from "react";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client."),
  projectId: z.string().min(1, "Please select a project."),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue", "Partial"]),
  issueDate: z.date(),
  dueDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required."),
  tax: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["days", "weeks", "months"]).optional(),
  recurringPeriod: z.coerce.number().min(1).optional(),
  lateFeeType: z.enum(["Percentage", "Flat Rate"]).optional(),
  lateFeeValue: z.coerce.number().min(0).optional(),
  automatedReminders: z.boolean().default(false),
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
  if (data.lateFeeValue && !data.lateFeeType) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lateFeeType"],
        message: "Type is required if a late fee value is set.",
    });
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
  services: Service[];
}

export function AddEditInvoiceDialog({
  open,
  onOpenChange,
  onSave,
  invoice,
  clients,
  projects,
  services,
}: AddEditInvoiceDialogProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      projectId: "",
      status: "Draft",
      lineItems: [],
      tax: 0,
      discount: 0,
      notes: "",
      terms: "",
      isRecurring: false,
      recurringInterval: 'days',
      recurringPeriod: 30,
      lateFeeType: undefined,
      lateFeeValue: 0,
      automatedReminders: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });
  
  const watchedLineItems = form.watch("lineItems");
  const watchedTax = form.watch("tax");
  const watchedDiscount = form.watch("discount");

  const { subtotal, total } = useMemo(() => {
    const sub = watchedLineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);
    const taxAmount = sub * (watchedTax / 100);
    const finalTotal = sub + taxAmount - watchedDiscount;
    return { subtotal: sub, total: finalTotal };
  }, [watchedLineItems, watchedTax, watchedDiscount]);


  useEffect(() => {
    if (open) {
      if (invoice) {
        form.reset({
          clientId: invoice.clientId,
          projectId: invoice.projectId,
          status: invoice.status,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          lineItems: invoice.lineItems.map(li => ({...li})),
          tax: invoice.tax,
          discount: invoice.discount,
          notes: invoice.notes,
          terms: invoice.terms,
          isRecurring: invoice.isRecurring ?? false,
          recurringInterval: invoice.recurringInterval ?? 'days',
          recurringPeriod: invoice.recurringPeriod,
          lateFeeType: invoice.lateFeeType,
          lateFeeValue: invoice.lateFeeValue,
          automatedReminders: invoice.automatedReminders,
        });
      } else {
        form.reset({
          clientId: "",
          projectId: "",
          status: "Draft",
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
          tax: 0,
          discount: 0,
          notes: "",
          terms: "",
          isRecurring: false,
          recurringInterval: 'days',
          recurringPeriod: 30,
          lateFeeType: undefined,
          lateFeeValue: 0,
          automatedReminders: false,
        });
      }
      setSelectedServiceId("");
    }
  }, [invoice, open, form]);

  const onSubmit = (data: InvoiceFormValues) => {
    onSave(data, invoice?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Make changes to your invoice here." : "Fill in the details for the new invoice."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
                {/* Left Column */}
                <div className="md:col-span-3 space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                        <div className="space-y-2">
                             <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                                <div className="col-span-2">Description</div>
                                <div>Quantity</div>
                                <div>Unit Price</div>
                             </div>
                             {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-4 gap-2 items-start">
                                    <FormField control={form.control} name={`lineItems.${index}.description`} render={({ field }) => (
                                        <FormItem className="col-span-2"><FormControl><Textarea placeholder="Service or item" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name={`lineItems.${index}.unitPrice`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                             ))}
                        </div>
                         <div className="flex items-center gap-2 pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Item
                            </Button>
                            <div className="flex-1"></div> {/* Spacer */}
                            <Select onValueChange={setSelectedServiceId}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Select a service to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(service => (
                                        <SelectItem key={service.id} value={service.id}>
                                            {service.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                size="sm"
                                disabled={!selectedServiceId}
                                onClick={() => {
                                    const service = services.find(s => s.id === selectedServiceId);
                                    if (service) {
                                        append({
                                            description: service.name,
                                            quantity: 1,
                                            unitPrice: service.defaultRate,
                                        });
                                    }
                                }}
                            >
                                Add Service
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem><FormLabel>Notes for Client</FormLabel><FormControl><Textarea placeholder="Any additional notes..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="terms" render={({ field }) => (
                            <FormItem><FormLabel>Terms & Conditions</FormLabel><FormControl><Textarea placeholder="e.g., Payment due in 30 days." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                        <FormField control={form.control} name="clientId" render={({ field }) => (
                            <FormItem><FormLabel>Client</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="projectId" render={({ field }) => (
                            <FormItem><FormLabel>Project</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem><SelectItem value="Sent">Sent</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Partial">Partial</SelectItem><SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="issueDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Issue Date</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button>
                                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="dueDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button>
                                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between items-center text-sm">
                            <FormField control={form.control} name="tax" render={({ field }) => (
                                <FormItem className="flex items-center gap-2"><FormLabel className="text-muted-foreground m-0">Tax (%)</FormLabel><FormControl><Input type="number" className="h-8 w-20" {...field} /></FormControl></FormItem>
                            )}/>
                            <span>${(subtotal * (watchedTax/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <FormField control={form.control} name="discount" render={({ field }) => (
                                <FormItem className="flex items-center gap-2"><FormLabel className="text-muted-foreground m-0">Discount</FormLabel><FormControl><Input type="number" className="h-8 w-20" {...field} /></FormControl></FormItem>
                            )}/>
                            <span>-${watchedDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg"><span>Total</span><span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                     </div>
                </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-2 gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Make Recurring</FormLabel><FormDescription>Automatically create and send this invoice on a schedule.</FormDescription></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {form.watch("isRecurring") && (
                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                    <FormField control={form.control} name="recurringPeriod" render={({ field }) => (
                        <FormItem><FormLabel>Repeat Every</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="recurringInterval" render={({ field }) => (
                        <FormItem><FormLabel>Interval</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select interval" /></SelectTrigger></FormControl><SelectContent>
                            <SelectItem value="days">Days</SelectItem><SelectItem value="weeks">Weeks</SelectItem><SelectItem value="months">Months</SelectItem>
                        </SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                  </div>
                )}
            </div>
             <Separator />

            <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-2 rounded-lg border p-3 shadow-sm">
                    <Label>Late Fees</Label>
                    <FormDescription>Apply a fee if the invoice becomes overdue.</FormDescription>
                    <div className="flex gap-2 pt-2">
                        <FormField
                            control={form.control}
                            name="lateFeeType"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Fee Type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Flat Rate">Flat Rate ($)</SelectItem>
                                            <SelectItem value="Percentage">Percentage (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="lateFeeValue"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input type="number" placeholder="Value" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="automatedReminders"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5"><FormLabel>Automated Reminders</FormLabel><FormDescription>Send reminders for overdue invoices automatically.</FormDescription></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                    )}
                />
            </div>
            
            <Separator />

            <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                    <Label>Payment Schedule</Label>
                    <FormDescription>Divide the total amount into multiple payment installments.</FormDescription>
                    <Button type="button" variant="outline" className="w-full" disabled>
                        Set Up Payment Schedule
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label>Attachments</Label>
                    <FormDescription>Attach relevant files like contracts or timesheets.</FormDescription>
                    <Button type="button" variant="outline" className="w-full" disabled>
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach Files
                    </Button>
                </div>
            </div>

            <DialogFooter className="pt-4">
              <div className="flex items-center gap-2">
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
