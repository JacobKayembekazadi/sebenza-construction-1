"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, PlusCircle, FileBarChart, Scale, Book, Landmark as LandmarkIcon } from "lucide-react";
import { bankAccounts, type BankAccount } from "@/lib/data";
import Image from "next/image";

const reportPlaceholders = [
    { title: "Profit & Loss", description: "Analyze your income and expenses.", icon: FileBarChart },
    { title: "Balance Sheet", description: "A snapshot of your assets and liabilities.", icon: Scale },
    { title: "General Ledger", description: "View all transactions for all accounts.", icon: Book },
    { title: "Trial Balance", description: "Summary of all ledger balances.", icon: LandmarkIcon },
]

export default function AccountingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
        <p className="text-muted-foreground">
          Manage your bank connections, reconcile transactions, and view
          financial reports.
        </p>
      </div>

      <Tabs defaultValue="reconciliation">
        <TabsList>
          <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="chart-of-accounts" disabled>Chart of Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="reconciliation" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Connected Bank Accounts</CardTitle>
                    <CardDescription>
                        Manage your linked bank accounts and import transactions.
                    </CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2" />
                    Connect New Account
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bank</TableHead>
                            <TableHead>Account Number</TableHead>
                            <TableHead>Current Balance</TableHead>
                             <TableHead>Last Imported</TableHead>
                            <TableHead className="w-[50px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bankAccounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Image src={account.logoUrl} alt={account.bankName} width={24} height={24} data-ai-hint="bank logo"/>
                                    {account.bankName}
                                </TableCell>
                                <TableCell>{account.accountNumber}</TableCell>
                                <TableCell>${account.balance.toLocaleString()}</TableCell>
                                <TableCell>Today</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Reconnect</DropdownMenuItem>
                                            <DropdownMenuItem>Import Statement (CSV)</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:bg-destructive/20">Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                <Button disabled>Start Reconciliation</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportPlaceholders.map(report => (
                    <Card key={report.title} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <report.icon className="h-6 w-6" />
                                <CardTitle>{report.title}</CardTitle>
                            </div>
                            <CardDescription>{report.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                            <Button variant="outline" disabled>Generate Report</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
