
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
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
  LifeBuoy,
  CheckCircle2,
} from "lucide-react";
import { supportTickets as initialTickets, type SupportTicket } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { AddEditSupportTicketDialog, type TicketFormValues } from "@/components/add-edit-support-ticket-dialog";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddTicketDialogOpen, setIsAddTicketDialogOpen] = useState(false);
  const { toast } = useToast();

  const statuses = ["All", "Open", "In Progress", "Resolved", "Closed"];

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return {
      openTickets: tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length,
      resolvedTickets: tickets.filter((t) => t.status === "Resolved").length,
    };
  }, [tickets]);

  const handleSaveTicket = (data: TicketFormValues) => {
    const newTicket: SupportTicket = {
      id: `tic-${Date.now()}`,
      status: "Open",
      createdAt: new Date(),
      ...data,
    };
    setTickets([newTicket, ...tickets]);
    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been received. We'll get back to you shortly.",
    });
  };

  const handleAction = (message: string) => {
    toast({ title: "Action", description: message });
  };
  
  const statusVariant = (status: SupportTicket['status']): 'green' | 'yellow' | 'outline' => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return "green";
      case "In Progress":
        return "yellow";
      case "Open":
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Get help and report issues with the Sebenza platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tickets currently being addressed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Issues that have been resolved.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>My Support Tickets</CardTitle>
            <CardDescription>
              A history of all your support requests.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID or subject..."
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
            <Button className="w-full sm:w-auto" onClick={() => setIsAddTicketDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">{ticket.id.toUpperCase()}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{ticket.subject}</TableCell>
                    <TableCell className="hidden md:table-cell">{ticket.department}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.priority === 'High' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(ticket.createdAt, "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction(`Viewing details for ticket ${ticket.id.toUpperCase()}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={ticket.status === 'Closed' || ticket.status === 'Resolved'} onClick={() => handleAction('This would cancel the ticket.')}>
                            Cancel Ticket
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
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditSupportTicketDialog
        open={isAddTicketDialogOpen}
        onOpenChange={setIsAddTicketDialogOpen}
        onSave={handleSaveTicket}
      />
    </div>
  );
}
