'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type BankTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  bankAccountId: string;
  category?: string;
  reference?: string;
};

type ImportTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankAccounts: Array<{ id: string; bankName: string; accountNumber: string }>;
  onImport: (transactions: Omit<BankTransaction, 'id'>[]) => void;
};

type ParsedTransaction = {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
  valid: boolean;
  errors: string[];
};

export function ImportTransactionDialog({
  open,
  onOpenChange,
  bankAccounts,
  onImport,
}: ImportTransactionDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [csvData, setCsvData] = useState<string>('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const parseCsv = (csvText: string): ParsedTransaction[] => {
    const lines = csvText.trim().split('\n');
    const transactions: ParsedTransaction[] = [];

    // Skip header row if it exists
    const dataLines = lines.slice(1);

    dataLines.forEach((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length < 3) {
        return; // Skip invalid rows
      }

      const errors: string[] = [];
      let date = columns[0];
      let description = columns[1];
      let amountStr = columns[2];
      let reference = columns[3] || '';

      // Validate date
      const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(date)) {
        errors.push('Invalid date format');
      } else {
        // Convert to YYYY-MM-DD format
        if (date.includes('/')) {
          const [month, day, year] = date.split('/');
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [month, day, year] = date.split('-');
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Validate description
      if (!description || description.length < 3) {
        errors.push('Description too short');
      }

      // Validate amount
      const amount = parseFloat(amountStr.replace(/[,$]/g, ''));
      if (isNaN(amount) || amount === 0) {
        errors.push('Invalid amount');
      }

      const type: 'credit' | 'debit' = amount > 0 ? 'credit' : 'debit';

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type,
        reference,
        valid: errors.length === 0,
        errors,
      });
    });

    return transactions;
  };

  const handleProcessCsv = () => {
    const parsed = parseCsv(csvData);
    setParsedTransactions(parsed);
    setStep('preview');
  };

  const handleImport = () => {
    if (!selectedBankAccount) {
      toast({
        title: 'Bank Account Required',
        description: 'Please select a bank account for these transactions.',
        variant: 'destructive',
      });
      return;
    }

    const validTransactions = parsedTransactions
      .filter(t => t.valid)
      .map(t => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        bankAccountId: selectedBankAccount,
        reference: t.reference,
        category: 'Other Expenses', // Default category
      }));

    if (validTransactions.length === 0) {
      toast({
        title: 'No Valid Transactions',
        description: 'Please fix the errors in your CSV file and try again.',
        variant: 'destructive',
      });
      return;
    }

    onImport(validTransactions);
    toast({
      title: 'Import Successful',
      description: `Successfully imported ${validTransactions.length} transaction(s).`,
    });

    // Reset state
    setCsvData('');
    setParsedTransactions([]);
    setSelectedBankAccount('');
    setStep('upload');
    onOpenChange(false);
  };

  const validCount = parsedTransactions.filter(t => t.valid).length;
  const invalidCount = parsedTransactions.length - validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Bank Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your bank transactions. Expected format: Date, Description, Amount, Reference (optional)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a CSV file with your bank transaction data
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload CSV file"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Column 1: Date (YYYY-MM-DD, MM/DD/YYYY, or MM-DD-YYYY)</li>
                  <li>• Column 2: Description (minimum 3 characters)</li>
                  <li>• Column 3: Amount (positive for credits, negative for debits)</li>
                  <li>• Column 4: Reference (optional)</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Select Bank Account</label>
                  <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleProcessCsv} disabled={!selectedBankAccount}>
                  Process CSV
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  File loaded successfully. Select the bank account and click "Process CSV" to continue.
                </p>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {validCount} Valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {invalidCount} Invalid
                  </Badge>
                )}
              </div>

              <div className="border rounded-md max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedTransactions.map((transaction, index) => (
                      <TableRow key={index} className={!transaction.valid ? 'bg-red-50' : ''}>
                        <TableCell>
                          {transaction.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span className="text-xs text-red-600">
                                {transaction.errors.join(', ')}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                        <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                            {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{transaction.reference || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={validCount === 0}>
              Import {validCount} Transaction{validCount !== 1 ? 's' : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
