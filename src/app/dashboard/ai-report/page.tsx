
"use client";

import { useState } from "react";
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
import { MoreHorizontal, PlusCircle, FileBarChart, Scale, Book, Landmark as LandmarkIcon, FileDown } from "lucide-react";
import { bankAccounts, type BankAccount } from "@/lib/data";
import Image from "next/image";
import { GenerateReportDialog } from "@/components/generate-report-dialog";
import { getFinancialReport } from "./actions";
import { useToast } from "@/hooks/use-toast";


const reportPlaceholders = [
    { key: "pnl", title: "Profit & Loss", description: "Analyze your income and expenses.", icon: FileBarChart, isEnabled: true },
    { key: "balance", title: "Balance Sheet", description: "A snapshot of your assets and liabilities.", icon: Scale, isEnabled: false },
    { key: "ledger", title: "General Ledger", description: "View all transactions for all accounts.", icon: Book, isEnabled: false },
    { key: "trial", title: "Trial Balance", description: "Summary of all ledger balances.", icon: LandmarkIcon, isEnabled: false },
];

export default function AccountingPage() {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const { toast } = useToast();

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsReportDialogOpen(true);
  };
  
  const handleExport = (format: 'CSV' | 'PDF' | 'Excel') => {
      toast({
          title: "Export Started",
          description: `Your data is being prepared for export as a ${format} file. This might take a moment.`
      })
  }
  
  const handleConnectAccount = () => {
    toast({
      title: "Simulating Bank Connection",
      description: "This would open a secure window (like Plaid) to connect your bank account.",
    });
  };

  const handleStartReconciliation = () => {
    toast({
      title: "Reconciliation Started",
      description: "The system is now matching your bank transactions with your invoices and expenses.",
    });
  };

  const handleAccountAction = (action: 'Reconnect' | 'Import' | 'Remove', account: BankAccount) => {
    let description = "";
    switch (action) {
        case 'Reconnect':
            description = `Attempting to reconnect your ${account.bankName} account.`;
            break;
        case 'Import':
            description = `This would open a file dialog to import a statement for your ${account.bankName} account.`;
            break;
        case 'Remove':
            description = `The account from ${account.bankName} would be unlinked and its data removed.`;
            break;
    }
    toast({
      title: `${action} Action Triggered`,
      description,
      variant: action === 'Remove' ? 'destructive' : 'default',
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
            <p className="text-muted-foreground">
              Manage bank connections, reconcile transactions, and view financial reports.
            </p>
          </div>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <FileDown className="mr-2" />
                    Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('CSV')}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('Excel')}>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('PDF')}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <Tabs defaultValue="reports">
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
                  <Button onClick={handleConnectAccount}>
                      <PlusCircle className="mr-2" />
                      Connect New Account
                  </Button>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Bank</TableHead>
                              <TableHead className="hidden sm:table-cell">Account Number</TableHead>
                              <TableHead>Current Balance</TableHead>
                              <TableHead className="hidden md:table-cell">Last Imported</TableHead>
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
                                  <TableCell className="hidden sm:table-cell">{account.accountNumber}</TableCell>
                                  <TableCell>${account.balance.toLocaleString()}</TableCell>
                                  <TableCell className="hidden md:table-cell">Today</TableCell>
                                  <TableCell className="text-right">
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Open menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => handleAccountAction('Reconnect', account)}>Reconnect</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => handleAccountAction('Import', account)}>Import Statement (CSV)</DropdownMenuItem>
                                              <DropdownMenuItem className="text-destructive focus:bg-destructive/20" onClick={() => handleAccountAction('Remove', account)}>Remove</DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
              <CardFooter>
                  <Button onClick={handleStartReconciliation}>Start Reconciliation</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportPlaceholders.map(report => (
                      <Card key={report.key} className="flex flex-col">
                          <CardHeader>
                              <div className="flex items-center gap-2 text-primary">
                                  <report.icon className="h-6 w-6" />
                                  <CardTitle>{report.title}</CardTitle>
                              </div>
                              <CardDescription>{report.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="mt-auto">
                              <Button variant="outline" disabled={!report.isEnabled} onClick={() => report.isEnabled && handleGenerateReport(report.title)}>Generate Report</Button>
                          </CardFooter>
                      </Card>
                  ))}
              </div>
          </TabsContent>
        </Tabs>
      </div>
      <GenerateReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        reportType={selectedReportType}
        onGenerate={getFinancialReport}
      />
    </>
  );
}
