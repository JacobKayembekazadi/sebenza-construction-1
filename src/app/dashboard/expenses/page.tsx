
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
  DollarSign,
  MoreHorizontal,
  Tag,
  Repeat,
  FileDown
} from "lucide-react";
import { expenses as initialExpenses, projects, type Expense } from "@/lib/data";
import { AddEditExpenseDialog, type ExpenseFormValues } from "@/components/add-edit-expense-dialog";
import { DeleteExpenseDialog } from "@/components/delete-expense-dialog";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const { toast } = useToast();

  const categories = ["All", ...Array.from(new Set(initialExpenses.map(e => e.category)))];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const summary = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    return {
      totalExpenses,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1]} : { name: "N/A", amount: 0 },
    };
  }, [expenses]);
  
  const handleOpenAddDialog = () => {
    setSelectedExpense(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveExpense = (data: ExpenseFormValues, expenseId?: string) => {
    const project = projects.find(p => p.id === data.projectId);
    if (!project) return;
    
    if (expenseId) {
      setExpenses(expenses.map(e => e.id === expenseId ? { ...e, ...data, projectName: project.name } : e));
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        projectName: project.name,
        receiptUrl: '',
        ...data,
      };
      setExpenses([newExpense, ...expenses]);
    }
  };

  const handleDeleteExpense = () => {
    if (selectedExpense) {
      setExpenses(expenses.filter(e => e.id !== selectedExpense.id));
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const handleExport = (format: 'CSV' | 'PDF' | 'Excel') => {
      toast({
          title: "Export Started",
          description: `Your expense data is being prepared for export as a ${format} file.`
      })
  };

  const handleImport = () => {
      toast({
          title: "Import from CSV",
          description: "This would open a file dialog to import expenses."
      })
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">
          Track and manage all project-related expenses.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.topCategory.name}</div>
            <p className="text-xs text-muted-foreground">
              ${summary.topCategory.amount.toLocaleString()} spent
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Expense Log</CardTitle>
            <CardDescription>
              A detailed record of all expenses.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by description..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex w-full sm:w-auto items-center gap-2">
                <Button variant="outline" className="w-full" onClick={handleImport} disabled>Import</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('CSV')}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('Excel')}>Export as Excel</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('PDF')}>Export as PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden lg:table-cell">Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Amount</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           {expense.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground" title="Recurring Expense" />}
                           <span>{expense.description}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <Link href={`/dashboard/projects/${expense.projectId}`} className="hover:underline">
                            {expense.projectName}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(expense.date, "PPP")}</TableCell>
                    <TableCell className="hidden sm:table-cell">${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={expense.isBillable ? 'secondary' : 'outline'}>
                        {expense.isBillable ? 'Yes' : 'No'}
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(expense)}>
                            Edit Expense
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(expense)} className="text-destructive focus:bg-destructive/20">
                            Delete Expense
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
                    No expenses found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditExpenseDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveExpense}
        expense={selectedExpense}
        projects={projects}
      />
      
      <DeleteExpenseDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteExpense}
        expense={selectedExpense}
      />
    </div>
  );
}
