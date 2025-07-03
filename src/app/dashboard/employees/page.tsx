
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { employees as initialEmployees, type Employee } from "@/lib/data";
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
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddEditEmployeeDialog, type EmployeeFormValues } from "@/components/add-edit-employee-dialog";
import { DeleteEmployeeDialog } from "@/components/delete-employee-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  
  // In a real app, this would come from the user's subscription data.
  const [userLimit, setUserLimit] = useState(10); 
  const limitReached = useMemo(() => employees.length >= userLimit, [employees.length, userLimit]);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const roles = ["All", ...Array.from(new Set(initialEmployees.map(e => e.role)))];

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === "All" || employee.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchTerm, roleFilter]);

  const summary = useMemo(() => {
    return {
      totalEmployees: employees.length,
      projectManagers: employees.filter((c) => c.role === "Project Manager").length,
    };
  }, [employees]);
  
  const handleOpenAddDialog = () => {
    if (limitReached) return;
    setSelectedEmployee(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEmployee = (data: EmployeeFormValues, employeeId?: string) => {
    if (employeeId) {
      setEmployees(employees.map(e => e.id === employeeId ? { ...e, ...data, avatar: "https://placehold.co/32x32.png" } : e));
    } else {
       if (limitReached) {
        // This is a safeguard, the button should be disabled anyway.
        console.error("User limit reached. Cannot add more employees.");
        return;
      }
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        avatar: "https://placehold.co/32x32.png",
        ...data,
      };
      setEmployees([newEmployee, ...employees]);
    }
  };

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter(e => e.id !== selectedEmployee.id));
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members and their roles.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEmployees} / {userLimit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Managers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.projectManagers}</div>
          </CardContent>
        </Card>
      </div>
      
       {limitReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>User Limit Reached</AlertTitle>
          <AlertDescription>
            You have reached your limit of {userLimit} users. To add more employees, please{" "}
            <Link href="/dashboard/settings" className="font-semibold underline">
              upgrade your plan.
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Search, filter, and manage all your team members.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog} disabled={limitReached}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="employee avatar" />
                                <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{employee.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {employee.role}
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(employee)}>
                            Edit Employee
                          </DropdownMenuItem>
                           <DropdownMenuItem disabled>
                            HR & Payroll
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(employee)} className="text-destructive focus:bg-destructive/20">
                            Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No employees found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditEmployeeDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />
      
      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteEmployee}
        employee={selectedEmployee}
      />
    </div>
  );
}
