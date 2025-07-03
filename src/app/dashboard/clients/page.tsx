

"use client";

import { useState, useMemo } from "react";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { clients as initialClients, projects as allProjects, invoices as allInvoices, estimates as allEstimates, expenses as allExpenses, type Client, type Project, type Invoice, type Estimate, type Expense } from "@/lib/data";
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
  Users,
  MoreHorizontal,
  CheckCircle,
  Mail,
  FileDown,
  Briefcase,
  FileText,
  Receipt,
  DollarSign,
  FolderArchive
} from "lucide-react";
import { type ClientFormValues, AddEditClientDialog } from "@/components/add-edit-client-dialog";
import { DeleteClientDialog } from "@/components/delete-client-dialog";
import { format } from "date-fns";

function ClientDetailView({ client }: { client: Client }) {
  const clientProjects = useMemo(() => allProjects.filter(p => p.clientId === client.id), [client.id]);
  const clientInvoices = useMemo(() => allInvoices.filter(i => i.clientId === client.id), [client.id]);
  const clientEstimates = useMemo(() => allEstimates.filter(e => e.clientId === client.id), [client.id]);
  const clientExpenses = useMemo(() => {
    const projectIds = clientProjects.map(p => p.id);
    return allExpenses.filter(e => projectIds.includes(e.projectId));
  }, [clientProjects]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl">{client.name}</CardTitle>
          <CardDescription>{client.company}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${client.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                </a>
            </Button>
            <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Statement
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="font-medium text-foreground">Email:</span> {client.email}</p>
                        <p><span className="font-medium text-foreground">Phone:</span> {client.phone}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Billing Address</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.billingAddress}</p>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.shippingAddress}</p>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="projects">
            <MiniTable icon={<Briefcase />} items={clientProjects} columns={['Name', 'Status', 'End Date']} renderRow={(item: Project) => (
                <>
                    <TableCell><Link href={`/dashboard/projects/${item.id}`} className="font-medium hover:underline">{item.name}</Link></TableCell>
                    <TableCell><Badge>{item.status}</Badge></TableCell>
                    <TableCell>{format(item.endDate, "PPP")}</TableCell>
                </>
            )} />
          </TabsContent>
           <TabsContent value="invoices">
            <MiniTable icon={<Receipt />} items={clientInvoices} columns={['Invoice ID', 'Status', 'Amount', 'Due Date']} renderRow={(item: Invoice) => (
                <>
                    <TableCell className="font-medium">{item.id.toUpperCase()}</TableCell>
                    <TableCell><Badge>{item.status}</Badge></TableCell>
                    <TableCell>${item.total.toLocaleString()}</TableCell>
                    <TableCell>{format(item.dueDate, "PPP")}</TableCell>
                </>
            )} />
          </TabsContent>
          <TabsContent value="quotes">
             <MiniTable icon={<FileText />} items={clientEstimates} columns={['Estimate ID', 'Status', 'Amount', 'Expiry Date']} renderRow={(item: Estimate) => (
                <>
                    <TableCell className="font-medium">{item.id.toUpperCase()}</TableCell>
                    <TableCell><Badge>{item.status}</Badge></TableCell>
                    <TableCell>${item.total.toLocaleString()}</TableCell>
                    <TableCell>{format(item.expiryDate, "PPP")}</TableCell>
                </>
            )} />
          </TabsContent>
          <TabsContent value="expenses">
            <MiniTable icon={<DollarSign />} items={clientExpenses} columns={['Description', 'Project', 'Amount', 'Date']} renderRow={(item: Expense) => (
                <>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell><Link href={`/dashboard/projects/${item.projectId}`} className="text-muted-foreground hover:underline">{item.projectName}</Link></TableCell>
                    <TableCell>${item.amount.toLocaleString()}</TableCell>
                    <TableCell>{format(item.date, "PPP")}</TableCell>
                </>
            )} />
          </TabsContent>
           <TabsContent value="documents">
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <FolderArchive className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No documents for this client yet.</p>
                </div>
           </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MiniTable({ icon, items, columns, renderRow }: { icon: React.ReactNode, items: any[], columns: string[], renderRow: (item: any) => React.ReactNode}) {
    if (items.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                {React.cloneElement(icon as React.ReactElement, { className: "w-12 h-12 text-muted-foreground" })}
                <p className="mt-4 text-muted-foreground">No {columns[0].toLowerCase()} found for this client.</p>
            </div>
        )
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.id}>
                        {renderRow(item)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClients[0]?.id || null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const statuses = ["All", "Active", "Inactive"];

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const summary = useMemo(() => {
    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "Active").length,
    };
  }, [clients]);
  
  const handleOpenAddDialog = () => {
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (client: Client) => {
    // For now, we just select the client. The detail view has no edit button yet.
    setSelectedClientId(client.id);
  };

  const handleOpenDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveClient = (data: ClientFormValues, clientId?: string) => {
    if (clientId) {
      setClients(clients.map(c => c.id === clientId ? { ...c, ...data } : c));
    } else {
      const newClient: Client = {
        id: `client-${Date.now()}`,
        ...data,
      };
      setClients([newClient, ...clients]);
      setSelectedClientId(newClient.id); // Select the new client
    }
  };

  const handleDeleteClient = () => {
    if (clientToDelete) {
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      if (selectedClientId === clientToDelete.id) {
          setSelectedClientId(clients[0]?.id || null);
      }
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <p className="text-muted-foreground">
          Your central hub for all client information and activities.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeClients}</div>
          </CardContent>
        </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Client Directory</CardTitle>
                        <CardDescription>
                        Search, filter, and manage all your clients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or company..."
                                    className="pl-8 w-full"
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
                        </div>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead className="text-right w-[50px]">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                <TableRow 
                                    key={client.id} 
                                    onClick={() => setSelectedClientId(client.id)}
                                    className="cursor-pointer"
                                    data-state={selectedClientId === client.id ? 'selected' : undefined}
                                >
                                    <TableCell>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-sm text-muted-foreground">{client.company}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenDeleteDialog(client)} className="text-destructive focus:bg-destructive/20">
                                                Delete Client
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell
                                    colSpan={2}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No clients found.
                                </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="justify-between">
                         <Button variant="outline" disabled>Import CSV</Button>
                         <Button onClick={handleOpenAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Client
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-2">
                {selectedClient ? (
                    <ClientDetailView client={selectedClient} />
                ) : (
                    <Card className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed">
                        <Users className="w-16 h-16 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Select a client to see details</p>
                    </Card>
                )}
            </div>
        </div>
      
      <AddEditClientDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveClient}
        // This dialog is now only for adding, as editing is implicit in the detail view
        client={null} 
      />
      
      <DeleteClientDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClient}
        client={clientToDelete}
      />
    </div>
  );
}
