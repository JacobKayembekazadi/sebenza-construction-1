
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Package,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { inventoryItems as initialItems, suppliers, type InventoryItem } from "@/lib/data";
import { AddEditInventoryItemDialog, type InventoryItemFormValues } from "@/components/add-edit-inventory-item-dialog";
import { useToast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const supplierOptions = ["All", ...Array.from(new Set(suppliers.map(s => s.name)))];

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSupplier =
        supplierFilter === "All" || item.supplierName === supplierFilter;
      return matchesSearch && matchesSupplier;
    });
  }, [inventoryItems, searchTerm, supplierFilter]);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: "Out of Stock", variant: "destructive", icon: <PackageX className="h-4 w-4" /> };
    if (item.quantity <= item.lowStockThreshold) return { label: "Low Stock", variant: "secondary", icon: <PackageX className="h-4 w-4 text-orange-500" /> };
    return { label: "In Stock", variant: "default", icon: <PackageCheck className="h-4 w-4" /> };
  };

  const handleOpenAddDialog = () => {
    setSelectedItem(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: InventoryItem) => {
    toast({ variant: "destructive", title: "Deletion disabled", description: "This feature is for demonstration purposes only."})
  };

  const handleSaveItem = (data: InventoryItemFormValues, itemId?: string) => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    if (!supplier) return;

    if (itemId) {
      setInventoryItems(inventoryItems.map(i => i.id === itemId ? { ...i, ...data, supplierName: supplier.name } : i));
      toast({ title: "Item Updated", description: `${data.name} has been updated in your inventory.`});
    } else {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        ...data,
        supplierName: supplier.name,
      };
      setInventoryItems([newItem, ...inventoryItems]);
      toast({ title: "Item Added", description: `${newItem.name} has been added to your inventory.`});
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Track stock levels, suppliers, and pricing for your materials.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique items in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <PackageX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length}</div>
            <p className="text-xs text-muted-foreground">
              Items at or below threshold
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <PackageX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.filter(i => i.quantity === 0).length}</div>
            <p className="text-xs text-muted-foreground">
              Items with zero quantity
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Stock List</CardTitle>
            <CardDescription>
              Manage all your inventory items.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by SKU or name..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                {supplierOptions.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.costPrice.toFixed(2)}</TableCell>
                    <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        <div className="flex items-center gap-2">
                           {status.icon} {status.label}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(item)}>
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(item)} className="text-destructive focus:bg-destructive/20">
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditInventoryItemDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveItem}
        item={selectedItem}
        suppliers={suppliers}
      />
      
    </div>
  );
}
