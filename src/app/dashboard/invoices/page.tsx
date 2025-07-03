
"use client";

import { useState, useMemo, useEffect } from "react";
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
  CircleDollarSign,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Send,
  CreditCard,
  History,
} from "lucide-react";
import { invoices as initialInvoices, clients, projects, type Invoice } from "@/lib/data";
import { AddEditInvoiceDialog, type InvoiceFormValues } from "@/components/add-edit-invoice-dialog";
import { DeleteInvoiceDialog } from "@/components/delete-invoice-dialog";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


const DueDateCell = ({ invoice }: { invoice: Invoice }) => {
    const [display, setDisplay] = useState(format(invoice.dueDate, "PPP"));

    useEffect(() => {
        if (invoice.status === 'Overdue') {
            const daysOverdue = differenceInCalendarDays(new Date(), invoice.dueDate);
            setDisplay(`${format(invoice.dueDate, "PPP")} (${daysOverdue} days overdue)`);
        } else {
            setDisplay(format(invoice.dueDate, "PPP"));
        }
    }, [invoice]);
    
    return (
        <span className={cn(invoice.status === 'Overdue' && "text-destructive font-semibold")}>
            {display}
        </span>
    );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const statuses = ["All", "Draft", "Sent", "Paid", "Partial", "Overdue"];

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const statusVariant = (status: Invoice['status']) => {
    switch (status) {
      case "Paid": return "default";
      case "Sent": return "secondary";
      case "Partial": return "secondary";
      case "Draft": return "outline";
      case "Overdue": return "destructive";
      default: return "outline";
    }
  };

  const summary = useMemo(() => {
    const outstanding = invoices
      .filter(e => e.status === 'Sent' || e.status === 'Overdue' || e.status === 'Partial')
      .reduce((sum, e) => sum + e.amount, 0);
    const overdueCount = invoices.filter((e) => e.status === "Overdue").length;
    const totalPaid = invoices
        .filter(e => e.status === 'Paid')
        .reduce((sum, e) => sum + e.amount, 0);
    return {
      outstanding,
      overdueCount,
      totalPaid,
    };
  }, [invoices]);

  const handleOpenAddDialog = () => {
    setSelectedInvoice(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveInvoice = (data: InvoiceFormValues, invoiceId?: string) => {
    const client = clients.find(c => c.id === data.clientId);
    const project = projects.find(p => p.id === data.projectId);
    if (!client || !project) return;
    
    if (invoiceId) {
      setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, ...data, clientName: client.name, projectName: project.name } : i));
      toast({
        title: "Invoice Updated",
        description: `Invoice ${invoiceId.toUpperCase()} has been successfully updated.`,
      });
    } else {
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        clientName: client.name,
        projectName: project.name,
        ...data,
      };
      setInvoices([newInvoice, ...invoices]);
      toast({
        title: "Invoice Created",
        description: `A new invoice ${newInvoice.id.toUpperCase()} has been successfully created.`,
      });
    }
  };

  const handleDeleteInvoice = () => {
    if (selectedInvoice) {
      setInvoices(invoices.filter(i => i.id !== selectedInvoice.id));
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${selectedInvoice.id.toUpperCase()} has been deleted.`,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleAction = (message: string) => {
    toast({ title: "Action Triggered", description: message });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Create, send, and track client invoices.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.outstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total amount for 'Sent', 'Partial', and 'Overdue' invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overdueCount}</div>
             <p className="text-xs text-muted-foreground">
              Invoices past their due date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalPaid.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              Total revenue from paid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              Manage all your client invoices.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, client, project..."
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
              New Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id.toUpperCase()}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/projects/${invoice.projectId}`} className="hover:underline">
                        {invoice.projectName}
                      </Link>
                    </TableCell>
                    <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>
                       <DueDateCell invoice={invoice} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(invoice.status)}>
                        {invoice.status}
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(invoice)}>
                            Edit Invoice
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAction('This would open a form to record a manual payment.')}>
                             <CreditCard /> Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('A payment reminder email would be sent to the client.')}>
                            <Send /> Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <History /> View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(invoice)} className="text-destructive focus:bg-destructive/20">
                            Delete Invoice
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
                    No invoices found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditInvoiceDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveInvoice}
        invoice={selectedInvoice}
        clients={clients}
        projects={projects}
      />
      
      <DeleteInvoiceDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteInvoice}
        invoice={selectedInvoice}
      />
    </div>
  );
}
