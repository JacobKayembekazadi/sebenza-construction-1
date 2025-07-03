
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
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItem, Supplier } from "@/lib/data";
import { useEffect } from "react";

const inventoryItemSchema = z.object({
  sku: z.string().min(1, "SKU is required."),
  name: z.string().min(3, "Item name must be at least 3 characters."),
  description: z.string().optional(),
  supplierId: z.string().min(1, "Please select a supplier."),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative."),
  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative."),
  lowStockThreshold: z.coerce.number().min(0, "Threshold cannot be negative."),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

interface AddEditInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: InventoryItemFormValues, itemId?: string) => void;
  item?: InventoryItem | null;
  suppliers: Supplier[];
}

export function AddEditInventoryItemDialog({
  open,
  onOpenChange,
  onSave,
  item,
  suppliers,
}: AddEditInventoryItemDialogProps) {
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      supplierId: "",
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: 10,
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          sku: item.sku,
          name: item.name,
          description: item.description,
          supplierId: item.supplierId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          lowStockThreshold: item.lowStockThreshold,
        });
      } else {
        form.reset({
          sku: "",
          name: "",
          description: "",
          supplierId: "",
          quantity: 0,
          costPrice: 0,
          sellingPrice: 0,
          lowStockThreshold: 10,
        });
      }
    }
  }, [item, open, form]);

  const onSubmit = (data: InventoryItemFormValues) => {
    onSave(data, item?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Inventory Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the details for this item." : "Fill in the details for the new inventory item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input placeholder="e.g., STL-IB-20" {...field} /></FormControl>
                  <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl><Input placeholder="e.g., I-Beam (20ft)" {...field} /></FormControl>
                  <FormMessage />
                  </FormItem>
              )}/>
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Describe the item..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}/>

             <FormField control={form.control} name="supplierId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger></FormControl>
                    <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )}/>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="costPrice" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cost Price ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="280.00" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Selling Price ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="350.00" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>

             <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantity on Hand</FormLabel>
                    <FormControl><Input type="number" placeholder="150" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl><Input type="number" placeholder="50" {...field} /></FormControl>
                     <FormDescription className="text-xs">Receive alerts when stock is low.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
