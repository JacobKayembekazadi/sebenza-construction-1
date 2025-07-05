
"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, PlusCircle, FileBarChart, Scale, Book, Landmark as LandmarkIcon, FileDown, Search, Filter, Upload, Edit, Trash2, RotateCcw, Download, Eye, Play, Archive, Calendar, DollarSign } from "lucide-react";
import { bankAccounts, financialReports, chartOfAccounts, type BankAccount, type FinancialReport, type ChartOfAccount } from "@/lib/data";
import Image from "next/image";
import { GenerateReportDialog } from "@/components/generate-report-dialog";
import { AddEditBankTransactionDialog, type BankTransaction } from "@/components/add-edit-bank-transaction-dialog";
import { DeleteBankTransactionDialog } from "@/components/delete-bank-transaction-dialog";
import { BulkOperationDialog } from "@/components/bulk-operation-dialog";
import { ImportTransactionDialog } from "@/components/import-transaction-dialog";
import { AddEditReportDialog } from "@/components/add-edit-report-dialog";
import { DeleteReportDialog } from "@/components/delete-report-dialog";
import { BulkReportOperationDialog } from "@/components/bulk-report-operation-dialog";
import { ReportViewDialog } from "@/components/report-view-dialog";
import { AddEditAccountDialog } from "@/components/add-edit-account-dialog";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { BulkAccountOperationDialog } from "@/components/bulk-account-operation-dialog";
import { getFinancialReport } from "./actions";
import { useToast } from "@/hooks/use-toast";


const reportPlaceholders = [
    { key: "pnl", title: "Profit & Loss", description: "Analyze your income and expenses.", icon: FileBarChart, isEnabled: true },
    { key: "balance", title: "Balance Sheet", description: "A snapshot of your assets and liabilities.", icon: Scale, isEnabled: false },
    { key: "ledger", title: "General Ledger", description: "View all transactions for all accounts.", icon: Book, isEnabled: false },
    { key: "trial", title: "Trial Balance", description: "Summary of all ledger balances.", icon: LandmarkIcon, isEnabled: false },
];

// Mock bank transactions data - in a real app, this would come from an API
const initialBankTransactions: BankTransaction[] = [
  { id: 'bt-1', date: '2024-01-15', description: 'Deposit from ABC Construction Ltd', amount: 12500.00, type: 'credit', bankAccountId: 'bank-1', category: 'Income', reconciled: false },
  { id: 'bt-2', date: '2024-01-10', description: 'Equipment Rental - Heavy Machinery', amount: 2800.00, type: 'debit', bankAccountId: 'bank-1', category: 'Equipment', reconciled: true },
  { id: 'bt-3', date: '2024-01-08', description: 'Online Payment - Smith Residential Project', amount: 8750.00, type: 'credit', bankAccountId: 'bank-2', category: 'Income', reconciled: false },
  { id: 'bt-4', date: '2024-01-05', description: 'Building Materials - Concrete & Steel', amount: 4200.00, type: 'debit', bankAccountId: 'bank-2', category: 'Materials', reconciled: true },
  { id: 'bt-5', date: '2024-01-03', description: 'Monthly Software Subscription', amount: 299.00, type: 'debit', bankAccountId: 'bank-3', category: 'Software Subscriptions', reconciled: false },
  { id: 'bt-6', date: '2024-01-02', description: 'ACH Transfer Office Supplies', amount: 450.00, type: 'debit', bankAccountId: 'bank-1', category: 'Office Supplies', reconciled: false },
  { id: 'bt-7', date: '2024-01-01', description: 'Subcontractor Payment - Electrical', amount: 3500.00, type: 'debit', bankAccountId: 'bank-3', category: 'Subcontractors', reconciled: true },
];

export default function AccountingPage() {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [transactions, setTransactions] = useState<BankTransaction[]>(initialBankTransactions);
  const [reports, setReports] = useState<FinancialReport[]>(financialReports);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(chartOfAccounts);
  
  // Transaction management dialogs
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  
  // Report management dialogs
  const [addEditReportDialogOpen, setAddEditReportDialogOpen] = useState(false);
  const [deleteReportDialogOpen, setDeleteReportDialogOpen] = useState(false);
  const [bulkReportDialogOpen, setBulkReportDialogOpen] = useState(false);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  
  // Chart of Accounts management dialogs
  const [addEditAccountDialogOpen, setAddEditAccountDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [bulkAccountDialogOpen, setBulkAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  
  // Filters and search for transactions
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [filterReconciled, setFilterReconciled] = useState<"all" | "reconciled" | "unreconciled">("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  
  // Filters and search for reports
  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportFilterType, setReportFilterType] = useState<string>("all");
  const [reportFilterStatus, setReportFilterStatus] = useState<"all" | "draft" | "active" | "archived">("all");
  
  // Filters and search for Chart of Accounts
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [accountFilterType, setAccountFilterType] = useState<"all" | "Asset" | "Liability" | "Equity" | "Income" | "Expense">("all");
  const [accountFilterStatus, setAccountFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [accountFilterSubType, setAccountFilterSubType] = useState<string>("all");
  
  const { toast } = useToast();

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || transaction.type === filterType;
      const matchesReconciled = filterReconciled === "all" || 
                               (filterReconciled === "reconciled" && transaction.reconciled) ||
                               (filterReconciled === "unreconciled" && !transaction.reconciled);
      const matchesAccount = filterAccount === "all" || transaction.bankAccountId === filterAccount;
      
      return matchesSearch && matchesType && matchesReconciled && matchesAccount;
    });
  }, [transactions, searchTerm, filterType, filterReconciled, filterAccount]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                           report.tags.some(tag => tag.toLowerCase().includes(reportSearchTerm.toLowerCase()));
      const matchesType = reportFilterType === "all" || report.type === reportFilterType;
      const matchesStatus = reportFilterStatus === "all" || report.status === reportFilterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, reportSearchTerm, reportFilterType, reportFilterStatus]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = account.accountName.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
                           account.accountCode.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
                           account.description.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
                           account.tags.some(tag => tag.toLowerCase().includes(accountSearchTerm.toLowerCase()));
      const matchesType = accountFilterType === "all" || account.accountType === accountFilterType;
      const matchesStatus = accountFilterStatus === "all" || 
                           (accountFilterStatus === "active" && account.isActive) ||
                           (accountFilterStatus === "inactive" && !account.isActive);
      const matchesSubType = accountFilterSubType === "all" || account.subType === accountFilterSubType;
      
      return matchesSearch && matchesType && matchesStatus && matchesSubType;
    });
  }, [accounts, accountSearchTerm, accountFilterType, accountFilterStatus, accountFilterSubType]);

  // Summary calculations
  const totalTransactions = transactions.length;
  const reconciledCount = transactions.filter(t => t.reconciled).length;
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

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

  // Transaction CRUD operations
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setAddEditDialogOpen(true);
  };

  const handleEditTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setAddEditDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleSaveTransaction = (transactionData: Omit<BankTransaction, 'id'> & { id?: string }) => {
    if (transactionData.id) {
      // Update existing transaction
      setTransactions(prev => 
        prev.map(t => t.id === transactionData.id ? { ...transactionData } as BankTransaction : t)
      );
    } else {
      // Add new transaction
      const newTransaction: BankTransaction = {
        ...transactionData,
        id: `bt-${Date.now()}`,
      } as BankTransaction;
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const handleDeleteConfirm = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const handleBulkUpdate = (transactionIds: string[], updates: Partial<BankTransaction>) => {
    setTransactions(prev => 
      prev.map(t => 
        transactionIds.includes(t.id) ? { ...t, ...updates } : t
      )
    );
  };

  const handleBulkDelete = (transactionIds: string[]) => {
    setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
  };

  const handleImportTransactions = (importedTransactions: Omit<BankTransaction, 'id'>[]) => {
    const newTransactions: BankTransaction[] = importedTransactions.map((t, index) => ({
      ...t,
      id: `bt-${Date.now()}-${index}`,
    }));
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  // Report CRUD operations
  const handleAddReport = () => {
    setSelectedReport(null);
    setAddEditReportDialogOpen(true);
  };

  const handleEditReport = (report: FinancialReport) => {
    setSelectedReport(report);
    setAddEditReportDialogOpen(true);
  };

  const handleDeleteReport = (report: FinancialReport) => {
    setSelectedReport(report);
    setDeleteReportDialogOpen(true);
  };

  const handleViewReport = (report: FinancialReport) => {
    setSelectedReport(report);
    setViewReportDialogOpen(true);
  };

  const handleSaveReport = (reportData: Omit<FinancialReport, 'id' | 'createdDate'> & { id?: string }) => {
    if (reportData.id) {
      // Update existing report
      setReports(prev => 
        prev.map(r => r.id === reportData.id ? { 
          ...reportData, 
          createdDate: prev.find(p => p.id === reportData.id)?.createdDate || new Date() 
        } as FinancialReport : r)
      );
      toast({
        title: "Report Updated",
        description: "The financial report has been successfully updated.",
      });
    } else {
      // Add new report
      const newReport: FinancialReport = {
        ...reportData,
        id: `rpt-${Date.now()}`,
        createdDate: new Date(),
      } as FinancialReport;
      setReports(prev => [...prev, newReport]);
      toast({
        title: "Report Created",
        description: "A new financial report has been successfully created.",
      });
    }
  };

  const handleDeleteReportConfirm = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
      title: "Report Deleted",
      description: "The financial report has been successfully deleted.",
    });
  };

  const handleBulkReportUpdate = (reportIds: string[], updates: Partial<FinancialReport>) => {
    setReports(prev => 
      prev.map(r => 
        reportIds.includes(r.id) ? { ...r, ...updates } : r
      )
    );
    toast({
      title: "Reports Updated",
      description: `${reportIds.length} report(s) have been successfully updated.`,
    });
  };

  const handleBulkReportDelete = (reportIds: string[]) => {
    setReports(prev => prev.filter(r => !reportIds.includes(r.id)));
    toast({
      title: "Reports Deleted",
      description: `${reportIds.length} report(s) have been successfully deleted.`,
    });
  };

  const handleBulkReportGenerate = (reportIds: string[]) => {
    // Update last generated date for selected reports
    setReports(prev => 
      prev.map(r => 
        reportIds.includes(r.id) ? { ...r, lastGenerated: new Date() } : r
      )
    );
    toast({
      title: "Reports Generated",
      description: `${reportIds.length} report(s) have been successfully generated.`,
    });
  };

  const handleGenerateSingleReport = (reportId: string) => {
    setReports(prev => 
      prev.map(r => 
        r.id === reportId ? { ...r, lastGenerated: new Date() } : r
      )
    );
    toast({
      title: "Report Generated",
      description: "The financial report has been successfully generated.",
    });
  };

  const handleDownloadReport = (reportId: string, format: string) => {
    const report = reports.find(r => r.id === reportId);
    toast({
      title: "Download Started",
      description: `Downloading ${report?.title} as ${format.toUpperCase()} file.`,
    });
  };

  const handleExportTransactions = () => {
    const csvContent = [
      'Date,Description,Amount,Type,Bank Account,Category,Reference,Reconciled',
      ...filteredTransactions.map(t => {
        const bankAccount = bankAccounts.find(b => b.id === t.bankAccountId);
        return `${t.date},"${t.description}",${t.amount},${t.type},"${bankAccount?.bankName}","${t.category || ''}","${t.reference || ''}",${t.reconciled ? 'Yes' : 'No'}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bank_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Export Successful",
      description: `Exported ${filteredTransactions.length} transactions to CSV file.`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterReconciled("all");
    setFilterAccount("all");
  };

  const clearReportFilters = () => {
    setReportSearchTerm("");
    setReportFilterType("all");
    setReportFilterStatus("all");
  };

  // Chart of Accounts CRUD operations
  const handleAddAccount = () => {
    setSelectedAccount(null);
    setAddEditAccountDialogOpen(true);
  };

  const handleEditAccount = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setAddEditAccountDialogOpen(true);
  };

  const handleDeleteAccount = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setDeleteAccountDialogOpen(true);
  };

  const handleSaveAccount = (accountData: Omit<ChartOfAccount, 'id' | 'createdDate' | 'lastModified'> & { id?: string }) => {
    if (accountData.id) {
      // Update existing account
      setAccounts(prev => 
        prev.map(a => a.id === accountData.id ? { 
          ...accountData, 
          id: accountData.id,
          createdDate: a.createdDate,
          lastModified: new Date()
        } as ChartOfAccount : a)
      );
      toast({
        title: "Account Updated",
        description: "The chart of account has been successfully updated.",
      });
    } else {
      // Add new account
      const newAccount: ChartOfAccount = {
        ...accountData,
        id: `acc-${Date.now()}`,
        createdDate: new Date(),
        lastModified: new Date(),
      } as ChartOfAccount;
      setAccounts(prev => [...prev, newAccount]);
      toast({
        title: "Account Created",
        description: "A new chart of account has been successfully created.",
      });
    }
    setAddEditAccountDialogOpen(false);
  };

  const handleDeleteAccountConfirm = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    toast({
      title: "Account Deleted",
      description: "The chart of account has been successfully deleted.",
    });
    setDeleteAccountDialogOpen(false);
  };

  const handleBulkAccountUpdate = (accountIds: string[], updateData: Partial<ChartOfAccount>) => {
    setAccounts(prev => 
      prev.map(a => 
        accountIds.includes(a.id) ? { ...a, ...updateData, lastModified: new Date() } : a
      )
    );
    toast({
      title: "Accounts Updated",
      description: `${accountIds.length} account(s) have been successfully updated.`,
    });
  };

  const handleBulkAccountDelete = (accountIds: string[]) => {
    setAccounts(prev => prev.filter(a => !accountIds.includes(a.id)));
    toast({
      title: "Accounts Deleted",
      description: `${accountIds.length} account(s) have been successfully deleted.`,
    });
  };

  const clearAccountFilters = () => {
    setAccountSearchTerm("");
    setAccountFilterType("all");
    setAccountFilterStatus("all");
    setAccountFilterSubType("all");
  };

  const handleExportAccounts = () => {
    const csvContent = [
      'Account Code,Account Name,Account Type,Sub Type,Description,Balance,Active,Created Date,Created By,Tags',
      ...filteredAccounts.map(a => 
        `"${a.accountCode}","${a.accountName}","${a.accountType}","${a.subType}","${a.description}",${a.balance},"${a.isActive ? 'Yes' : 'No'}","${a.createdDate.toLocaleDateString()}","${a.createdBy}","${a.tags.join(', ')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `chart_of_accounts_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Export Successful",
      description: `Exported ${filteredAccounts.length} accounts to CSV file.`,
    });
  };

  const handleExportReports = () => {
    const csvContent = [
      'Title,Type,Status,Created Date,Last Generated,Created By,Tags',
      ...filteredReports.map(r => 
        `"${r.title}","${r.type}","${r.status}","${r.createdDate.toLocaleDateString()}","${r.lastGenerated?.toLocaleDateString() || 'Never'}","${r.createdBy}","${r.tags.join(', ')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Export Successful",
      description: `Exported ${filteredReports.length} reports to CSV file.`,
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
            <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
          </TabsList>
          <TabsContent value="reconciliation" className="mt-6">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTransactions}</div>
                    <p className="text-xs text-muted-foreground">All bank transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{reconciledCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalTransactions > 0 ? Math.round((reconciledCount / totalTransactions) * 100) : 0}% complete
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">Money in</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">Money out</p>
                  </CardContent>
                </Card>
              </div>

              {/* Bank Accounts Section */}
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
              </Card>

              {/* Transactions Section */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Bank Transactions</CardTitle>
                      <CardDescription>
                        Manage and reconcile your bank transactions
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                      </Button>
                      <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bulk Actions
                      </Button>
                      <Button onClick={handleAddTransaction}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Transaction
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters and Search */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="credit">Credits</SelectItem>
                          <SelectItem value="debit">Debits</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterReconciled} onValueChange={(value: any) => setFilterReconciled(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="reconciled">Reconciled</SelectItem>
                          <SelectItem value="unreconciled">Unreconciled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterAccount} onValueChange={setFilterAccount}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Accounts</SelectItem>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {filteredTransactions.length} of {totalTransactions} transactions</span>
                    {(searchTerm || filterType !== "all" || filterReconciled !== "all" || filterAccount !== "all") && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <Filter className="mr-1 h-3 w-3" />
                        Clear filters
                      </Button>
                    )}
                  </div>

                  {/* Transactions Table */}
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Bank Account</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchTerm || filterType !== "all" || filterReconciled !== "all" || filterAccount !== "all" 
                                ? "No transactions match your current filters." 
                                : "No transactions found. Add your first transaction to get started."
                              }
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTransactions.map((transaction) => {
                            const bankAccount = bankAccounts.find(b => b.id === transaction.bankAccountId);
                            return (
                              <TableRow key={transaction.id}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {transaction.description}
                                </TableCell>
                                <TableCell>{bankAccount?.bankName || 'Unknown'}</TableCell>
                                <TableCell>
                                  {transaction.category ? (
                                    <Badge variant="secondary" className="text-xs">
                                      {transaction.category}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={transaction.reconciled ? "default" : "secondary"}
                                    className={transaction.reconciled ? "bg-green-100 text-green-800" : ""}
                                  >
                                    {transaction.reconciled ? 'Reconciled' : 'Pending'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleBulkUpdate([transaction.id], { reconciled: !transaction.reconciled })}
                                      >
                                        {transaction.reconciled ? 'Mark as Unreconciled' : 'Mark as Reconciled'}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive focus:bg-destructive/20"
                                        onClick={() => handleDeleteTransaction(transaction)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              {/* Summary Cards for Reports */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reports.length}</div>
                    <p className="text-xs text-muted-foreground">All financial reports</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {reports.filter(r => r.status === 'active').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {reports.filter(r => r.isScheduled).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Auto-generated</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Draft Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {reports.filter(r => r.status === 'draft').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Work in progress</p>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Management */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Financial Reports</CardTitle>
                      <CardDescription>
                        Create, manage, and schedule your financial reports
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setBulkReportDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bulk Actions
                      </Button>
                      <Button onClick={handleAddReport}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Report
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters and Search for Reports */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search reports..."
                          value={reportSearchTerm}
                          onChange={(e) => setReportSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={reportFilterType} onValueChange={setReportFilterType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                          <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                          <SelectItem value="cash-flow">Cash Flow</SelectItem>
                          <SelectItem value="general-ledger">General Ledger</SelectItem>
                          <SelectItem value="trial-balance">Trial Balance</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={reportFilterStatus} onValueChange={(value: any) => setReportFilterStatus(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={clearReportFilters}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportReports}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {filteredReports.length} of {reports.length} reports</span>
                    {(reportSearchTerm || reportFilterType !== "all" || reportFilterStatus !== "all") && (
                      <Button variant="ghost" size="sm" onClick={clearReportFilters}>
                        <Filter className="mr-1 h-3 w-3" />
                        Clear filters
                      </Button>
                    )}
                  </div>

                  {/* Reports Table */}
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Last Generated</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {reportSearchTerm || reportFilterType !== "all" || reportFilterStatus !== "all" 
                                ? "No reports match your current filters." 
                                : "No reports found. Create your first report to get started."
                              }
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{report.title}</div>
                                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {report.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {report.type.replace('-', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    report.status === 'active' ? 'default' : 
                                    report.status === 'draft' ? 'secondary' : 
                                    'outline'
                                  }
                                  className={
                                    report.status === 'active' ? 'bg-green-100 text-green-800' :
                                    report.status === 'draft' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {report.isScheduled ? (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-blue-600" />
                                    <span className="text-sm capitalize">{report.scheduleFrequency}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Manual</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {report.lastGenerated ? 
                                  report.lastGenerated.toLocaleDateString() : 
                                  <span className="text-muted-foreground">Never</span>
                                }
                              </TableCell>
                              <TableCell>{report.createdBy}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewReport(report)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditReport(report)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleGenerateReport(report.type)}>
                                      <Play className="mr-2 h-4 w-4" />
                                      Generate Now
                                    </DropdownMenuItem>
                                    {report.status !== 'archived' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleBulkReportUpdate([report.id], { status: 'archived' })}
                                      >
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      className="text-destructive focus:bg-destructive/20"
                                      onClick={() => handleDeleteReport(report)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Report Generation Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Report Generation</CardTitle>
                  <CardDescription>
                    Generate common financial reports instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportPlaceholders.map(report => (
                      <Card key={report.key} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 text-primary">
                            <report.icon className="h-5 w-5" />
                            <CardTitle className="text-base">{report.title}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">{report.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto pt-0">
                          <Button 
                            variant="outline" 
                            disabled={!report.isEnabled} 
                            onClick={() => report.isEnabled && handleGenerateReport(report.title)}
                            size="sm"
                            className="w-full"
                          >
                            Generate
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="chart-of-accounts" className="mt-6">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{accounts.length}</div>
                    <p className="text-xs text-muted-foreground">All chart of accounts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{accounts.filter(a => a.isActive).length}</div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${accounts.filter(a => a.accountType === 'Asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Asset account balances</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ${accounts.filter(a => a.accountType === 'Liability').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Liability account balances</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart of Accounts Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Chart of Accounts</CardTitle>
                      <CardDescription>
                        Manage your accounting structure and account classifications
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportAccounts}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkAccountDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Bulk Actions
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddAccount}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search accounts..."
                        value={accountSearchTerm}
                        onChange={(e) => setAccountSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={accountFilterType} onValueChange={(value: any) => setAccountFilterType(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Asset">Assets</SelectItem>
                        <SelectItem value="Liability">Liabilities</SelectItem>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={accountFilterStatus} onValueChange={(value: any) => setAccountFilterStatus(value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={clearAccountFilters}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>

                  {/* Accounts Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account Code</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Sub Type</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccounts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No accounts found. {accountSearchTerm || accountFilterType !== "all" || accountFilterStatus !== "all" ? "Try adjusting your search filters." : "Add your first account to get started."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAccounts.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">{account.accountCode}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{account.accountName}</div>
                                  <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={account.description}>
                                    {account.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  account.accountType === 'Asset' ? 'default' :
                                  account.accountType === 'Liability' ? 'destructive' :
                                  account.accountType === 'Equity' ? 'secondary' :
                                  account.accountType === 'Income' ? 'default' : 'outline'
                                }>
                                  {account.accountType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{account.subType}</TableCell>
                              <TableCell className="text-right font-mono">
                                <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  ${account.balance.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={account.isActive ? 'default' : 'secondary'}>
                                  {account.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {account.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {account.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{account.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteAccount(account)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
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
      
      {/* Transaction Management Dialogs */}
      <AddEditBankTransactionDialog
        open={addEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        transaction={selectedTransaction || undefined}
        bankAccounts={bankAccounts}
        onSave={handleSaveTransaction}
      />
      
      <DeleteBankTransactionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        transaction={selectedTransaction}
        onDelete={handleDeleteConfirm}
      />
      
      <BulkOperationDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        transactions={filteredTransactions}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
      />
      
      <ImportTransactionDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        bankAccounts={bankAccounts}
        onImport={handleImportTransactions}
      />

      {/* Report Management Dialogs */}
      <AddEditReportDialog
        open={addEditReportDialogOpen}
        onOpenChange={setAddEditReportDialogOpen}
        report={selectedReport || undefined}
        onSave={handleSaveReport}
      />
      
      <DeleteReportDialog
        open={deleteReportDialogOpen}
        onOpenChange={setDeleteReportDialogOpen}
        report={selectedReport}
        onDelete={handleDeleteReportConfirm}
      />
      
      <BulkReportOperationDialog
        open={bulkReportDialogOpen}
        onOpenChange={setBulkReportDialogOpen}
        reports={filteredReports}
        onBulkUpdate={handleBulkReportUpdate}
        onBulkDelete={handleBulkReportDelete}
        onBulkGenerate={handleBulkReportGenerate}
      />
      
      <ReportViewDialog
        open={viewReportDialogOpen}
        onOpenChange={setViewReportDialogOpen}
        report={selectedReport}
        onGenerate={handleGenerateSingleReport}
        onDownload={handleDownloadReport}
      />

      {/* Chart of Accounts Management Dialogs */}
      <AddEditAccountDialog
        open={addEditAccountDialogOpen}
        onOpenChange={setAddEditAccountDialogOpen}
        account={selectedAccount || undefined}
        accounts={accounts}
        bankAccounts={bankAccounts}
        onSave={handleSaveAccount}
      />
      
      <DeleteAccountDialog
        open={deleteAccountDialogOpen}
        onOpenChange={setDeleteAccountDialogOpen}
        account={selectedAccount}
        accounts={accounts}
        onDelete={handleDeleteAccountConfirm}
      />
      
      <BulkAccountOperationDialog
        open={bulkAccountDialogOpen}
        onOpenChange={setBulkAccountDialogOpen}
        accounts={filteredAccounts}
        onBulkUpdate={handleBulkAccountUpdate}
        onBulkDelete={handleBulkAccountDelete}
      />
    </>
  );
}
