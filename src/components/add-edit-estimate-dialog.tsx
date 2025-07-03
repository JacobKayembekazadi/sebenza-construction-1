
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
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Estimate, Client } from "@/lib/data";
import { useEffect, useMemo } from "react";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
});

const estimateSchema = z.object({
  clientId: z.string().min(1, "Please select a client."),
  status: z.enum(["Draft", "Sent", "Accepted", "Declined"]),
  issueDate: z.date(),
  expiryDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required."),
  tax: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
}).refine(data => data.expiryDate >= data.issueDate, {
  message: "Expiry date cannot be before issue date.",
  path: ["expiryDate"],
});

export type EstimateFormValues = z.infer<typeof estimateSchema>;

interface AddEditEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EstimateFormValues, estimateId?: string) => void;
  estimate?: Estimate | null;
  clients: Client[];
}

export function AddEditEstimateDialog({
  open,
  onOpenChange,
  onSave,
  estimate,
  clients,
}: AddEditEstimateDialogProps) {
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      clientId: "",
      status: "Draft",
      lineItems: [],
      tax: 0,
      discount: 0,
      notes: "",
      terms: ""
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
      if (estimate) {
        form.reset({
          clientId: estimate.clientId,
          status: estimate.status,
          issueDate: new Date(estimate.issueDate),
          expiryDate: new Date(estimate.expiryDate),
          lineItems: estimate.lineItems.map(li => ({...li})),
          tax: estimate.tax,
          discount: estimate.discount,
          notes: estimate.notes,
          terms: estimate.terms,
        });
      } else {
        form.reset({
          clientId: "",
          status: "Draft",
          issueDate: new Date(),
          expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
          tax: 0,
          discount: 0,
          notes: "",
          terms: ""
        });
      }
    }
  }, [estimate, open, form]);

  const onSubmit = (data: EstimateFormValues) => {
    onSave(data, estimate?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{estimate ? "Edit Estimate" : "Create New Estimate"}</DialogTitle>
          <DialogDescription>
            {estimate ? "Make changes to your estimate here." : "Fill in the details for the new estimate."}
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
                                    <FormField
                                        control={form.control}
                                        name={`lineItems.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormControl>
                                                    <Textarea placeholder="Service or item" {...field} className="h-10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`lineItems.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" placeholder="1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name={`lineItems.${index}.unitPrice`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                             ))}
                        </div>
                         <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes for Client</FormLabel>
                                <FormControl><Textarea placeholder="Any additional notes..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="terms" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Terms & Conditions</FormLabel>
                                <FormControl><Textarea placeholder="e.g., Payment due in 30 days." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                        <FormField control={form.control} name="clientId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                                    <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Sent">Sent</SelectItem>
                                        <SelectItem value="Accepted">Accepted</SelectItem>
                                        <SelectItem value="Declined">Declined</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="issueDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Issue Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                </Popover><FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="expiryDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Expiry Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                </Popover><FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <FormField control={form.control} name="tax" render={({ field }) => (
                                <FormItem className="flex items-center gap-2"><FormLabel className="text-muted-foreground m-0">Tax (%)</FormLabel>
                                <FormControl><Input type="number" className="h-8 w-20" {...field} /></FormControl>
                                </FormItem>
                            )}/>
                            <span>${(subtotal * (watchedTax/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <FormField control={form.control} name="discount" render={({ field }) => (
                                <FormItem className="flex items-center gap-2"><FormLabel className="text-muted-foreground m-0">Discount</FormLabel>
                                <FormControl><Input type="number" className="h-8 w-20" {...field} /></FormControl>
                                </FormItem>
                            )}/>
                            <span>-${watchedDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                     </div>
                </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" disabled>E-Sign Options</Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Estimate</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
