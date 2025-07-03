
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
import type { PurchaseOrder, Supplier } from "@/lib/data";
import { useEffect, useMemo } from "react";
import { Textarea } from "./ui/textarea";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
});

const poSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier."),
  status: z.enum(["Draft", "Sent", "Fulfilled", "Cancelled"]),
  issueDate: z.date(),
  deliveryDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required."),
  notes: z.string().optional(),
}).refine(data => data.deliveryDate >= data.issueDate, {
  message: "Delivery date cannot be before issue date.",
  path: ["deliveryDate"],
});

export type POFormValues = z.infer<typeof poSchema>;

interface AddEditPODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: POFormValues, poId?: string) => void;
  purchaseOrder?: PurchaseOrder | null;
  suppliers: Supplier[];
}

export function AddEditPODialog({
  open,
  onOpenChange,
  onSave,
  purchaseOrder,
  suppliers,
}: AddEditPODialogProps) {
  const form = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      supplierId: "",
      status: "Draft",
      lineItems: [],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });
  
  const watchedLineItems = form.watch("lineItems");

  const total = useMemo(() => {
    return watchedLineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);
  }, [watchedLineItems]);


  useEffect(() => {
    if (open) {
      if (purchaseOrder) {
        form.reset({
          supplierId: purchaseOrder.supplierId,
          status: purchaseOrder.status,
          issueDate: new Date(purchaseOrder.issueDate),
          deliveryDate: new Date(purchaseOrder.deliveryDate),
          lineItems: purchaseOrder.lineItems.map(li => ({...li})),
          notes: purchaseOrder.notes,
        });
      } else {
        form.reset({
          supplierId: "",
          status: "Draft",
          issueDate: new Date(),
          deliveryDate: new Date(new Date().setDate(new Date().getDate() + 14)),
          lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
          notes: "",
        });
      }
    }
  }, [purchaseOrder, open, form]);

  const onSubmit = (data: POFormValues) => {
    onSave(data, purchaseOrder?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchaseOrder ? "Edit Purchase Order" : "Create New Purchase Order"}</DialogTitle>
          <DialogDescription>
            {purchaseOrder ? "Make changes to your PO here." : "Fill in the details for the new PO."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="supplierId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger></FormControl>
                            <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
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
                                <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Expected Delivery</FormLabel>
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
                <div className="space-y-2">
                    <div className="grid grid-cols-10 gap-2 text-sm font-medium text-muted-foreground">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit Price</div>
                        <div className="col-span-1"></div>
                    </div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-10 gap-2 items-start">
                            <FormField control={form.control} name={`lineItems.${index}.description`} render={({ field }) => (
                                <FormItem className="col-span-5"><FormControl><Textarea placeholder="Item or service" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (
                                <FormItem className="col-span-2"><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`lineItems.${index}.unitPrice`} render={({ field }) => (
                                <FormItem className="col-span-2"><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
                </Button>
                 <div className="flex justify-end items-center font-bold text-lg pr-12">
                    <span>Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                    <FormLabel>Notes for Supplier</FormLabel>
                    <FormControl><Textarea placeholder="Shipping instructions, contact info, etc." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Purchase Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
