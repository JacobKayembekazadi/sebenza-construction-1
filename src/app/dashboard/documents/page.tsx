
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  ClipboardList,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Send,
  Printer,
  FileCheck2
} from "lucide-react";
import { purchaseOrders as initialPOs, suppliers, type PurchaseOrder } from "@/lib/data";
import { AddEditPODialog, type POFormValues } from "@/components/add-edit-document-dialog";
import { DeletePODialog } from "@/components/delete-document-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPOs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();

  const statuses = ["All", "Draft", "Sent", "Fulfilled", "Cancelled"];

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  const statusVariant = (status: PurchaseOrder['status']) => {
    switch (status) {
      case "Fulfilled": return "default";
      case "Sent": return "secondary";
      case "Draft": return "outline";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const summary = useMemo(() => {
    const totalValue = purchaseOrders.reduce((sum, e) => sum + e.total, 0);
    const openPOs = purchaseOrders.filter((e) => e.status === "Sent" || e.status === "Draft").length;
    return {
      totalPOs: purchaseOrders.length,
      totalValue,
      openPOs,
    };
  }, [purchaseOrders]);

  const handleOpenAddDialog = () => {
    setSelectedPO(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDeleteDialogOpen(true);
  };

  const handleSavePO = (data: POFormValues, poId?: string) => {
    const supplier = suppliers.find(c => c.id === data.supplierId);
    if (!supplier) return;

    const total = data.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const finalData = {
        ...data,
        supplierName: supplier.name,
        total,
        lineItems: data.lineItems.map((li, index) => ({
            ...li,
            id: li.id || `li-${Date.now()}-${index}`,
            total: li.quantity * li.unitPrice,
        }))
    };
    
    if (poId) {
      setPurchaseOrders(purchaseOrders.map(e => e.id === poId ? { ...e, ...finalData } : e));
      toast({ title: "Purchase Order Updated", description: `PO ${poId.toUpperCase()} has been saved.`});
    } else {
      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        ...finalData,
      };
      setPurchaseOrders([newPO, ...purchaseOrders]);
      toast({ title: "Purchase Order Created", description: `New PO ${newPO.id.toUpperCase()} has been created.`});
    }
  };

  const handleDeletePO = () => {
    if (selectedPO) {
        setPurchaseOrders(purchaseOrders.filter(e => e.id !== selectedPO.id));
        toast({
            title: "Purchase Order Deleted",
            description: `PO ${selectedPO.id.toUpperCase()} has been deleted.`,
            variant: "destructive"
        });
        setIsDeleteDialogOpen(false);
        setSelectedPO(null);
    }
  };

  const handleAction = (message: string) => {
    toast({ title: "Action Triggered", description: message });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-muted-foreground">
          Create and manage purchase orders for your suppliers.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PO Value</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total value of all purchase orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open POs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.openPOs}</div>
            <p className="text-xs text-muted-foreground">
              'Draft' or 'Sent' status
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Purchase Order List</CardTitle>
            <CardDescription>
              Manage all your supplier purchase orders.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID or supplier..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New PO
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.length > 0 ? (
                filteredPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.id.toUpperCase()}</TableCell>
                    <TableCell>{po.supplierName}</TableCell>
                    <TableCell>{format(po.issueDate, "PPP")}</TableCell>
                    <TableCell>{format(po.deliveryDate, "PPP")}</TableCell>
                    <TableCell>${po.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(po.status)}>
                        {po.status}
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(po)}>
                            Edit PO
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('This would email the PO to the supplier.')}>
                            <Send />
                            Send to Supplier
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAction('This would open a print dialog.')}>
                            <Printer />
                            Print/Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleAction('This would convert the PO to a bill/expense.')}>
                            <FileCheck2 />
                            Convert to Bill
                          </DropdownMenuItem>
                           <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(po)} className="text-destructive focus:bg-destructive/20">
                            Delete PO
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditPODialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSavePO}
        purchaseOrder={selectedPO}
        suppliers={suppliers}
      />
      
      <DeletePODialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeletePO}
        purchaseOrder={selectedPO}
      />
    </div>
  );
}
