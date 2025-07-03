
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
  FileText,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Copy,
  FileDown,
  FilePlus2,
  Send,
} from "lucide-react";
import { estimates as initialEstimates, clients, type Estimate, type EstimateLineItem } from "@/lib/data";
import { AddEditEstimateDialog, type EstimateFormValues } from "@/components/add-edit-estimate-dialog";
import { DeleteEstimateDialog } from "@/components/delete-estimate-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>(initialEstimates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const { toast } = useToast();

  const statuses = ["All", "Draft", "Sent", "Accepted", "Declined"];

  const filteredEstimates = useMemo(() => {
    return estimates.filter((estimate) => {
      const matchesSearch =
        estimate.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || estimate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [estimates, searchTerm, statusFilter]);

  const statusVariant = (status: Estimate['status']) => {
    switch (status) {
      case "Accepted": return "default";
      case "Sent": return "secondary";
      case "Draft": return "outline";
      case "Declined": return "destructive";
      default: return "outline";
    }
  };

  const summary = useMemo(() => {
    const totalValue = estimates.reduce((sum, e) => sum + e.total, 0);
    const pendingEstimates = estimates.filter((e) => e.status === "Sent" || e.status === "Draft").length;
    const acceptedValue = estimates.filter(e => e.status === 'Accepted').reduce((sum, e) => sum + e.total, 0);
    return {
      totalEstimates: estimates.length,
      totalValue,
      pendingEstimates,
      acceptedValue,
    };
  }, [estimates]);

  const handleOpenAddDialog = () => {
    setSelectedEstimate(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEstimate = (data: EstimateFormValues, estimateId?: string) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;

    const subtotal = data.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const total = subtotal * (1 + data.tax / 100) - data.discount;

    const finalData = {
        ...data,
        clientName: client.name,
        subtotal,
        total,
        lineItems: data.lineItems.map((li, index) => ({
            ...li,
            id: li.id || `li-${Date.now()}-${index}`,
            total: li.quantity * li.unitPrice,
        }))
    };
    
    if (estimateId) {
      setEstimates(estimates.map(e => e.id === estimateId ? { ...e, ...finalData } : e));
      toast({ title: "Estimate Updated", description: `Estimate ${estimateId.toUpperCase()} has been saved.`});
    } else {
      const newEstimate: Estimate = {
        id: `est-${Date.now()}`,
        ...finalData,
      };
      setEstimates([newEstimate, ...estimates]);
      toast({ title: "Estimate Created", description: `New estimate ${newEstimate.id.toUpperCase()} has been created.`});
    }
  };

  const handleDeleteEstimate = () => {
    if (selectedEstimate) {
      setEstimates(estimates.filter(e => e.id !== selectedEstimate.id));
      setIsDeleteDialogOpen(false);
      setSelectedEstimate(null);
    }
  };

  const handleDuplicate = (estimateToDuplicate: Estimate) => {
    const newEstimate: Estimate = {
        ...estimateToDuplicate,
        id: `est-${Date.now()}`,
        status: 'Draft',
        issueDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    };
    setEstimates([newEstimate, ...estimates]);
    toast({ title: "Estimate Duplicated", description: `New draft created from ${estimateToDuplicate.id.toUpperCase()}.`});
  };

  const handleAction = (message: string) => {
    toast({ title: "Action Triggered", description: message });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
        <p className="text-muted-foreground">
          Create, send, and track project estimates for clients.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Estimates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingEstimates}</div>
            <p className="text-xs text-muted-foreground">
              'Draft' or 'Sent' status
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Value</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.acceptedValue.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              Total value of all accepted estimates
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Estimate List</CardTitle>
            <CardDescription>
              Manage all your project cost estimates.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID or client..."
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
              New Estimate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.length > 0 ? (
                filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium">{estimate.id.toUpperCase()}</TableCell>
                    <TableCell>{estimate.clientName}</TableCell>
                    <TableCell>{format(estimate.issueDate, "PPP")}</TableCell>
                    <TableCell>{format(estimate.expiryDate, "PPP")}</TableCell>
                    <TableCell>${estimate.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(estimate.status)}>
                        {estimate.status}
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(estimate)}>
                            Edit Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(estimate)}>
                            <Copy />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('This would open a print dialog.')}>
                            <FileDown />
                            Print/Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleAction('This would email the client.')}>
                            <Send />
                            Send to Client
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAction('This would convert the estimate to an invoice.')}>
                            <FilePlus2 />
                            Convert to Invoice
                          </DropdownMenuItem>
                           <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(estimate)} className="text-destructive focus:bg-destructive/20">
                            Delete Estimate
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
                    No estimates found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditEstimateDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveEstimate}
        estimate={selectedEstimate}
        clients={clients}
      />
      
      <DeleteEstimateDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteEstimate}
        estimate={selectedEstimate}
      />
    </div>
  );
}
