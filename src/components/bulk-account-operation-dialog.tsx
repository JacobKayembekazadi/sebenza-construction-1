'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Archive, ArchiveRestore, Tag, AlertTriangle } from 'lucide-react';

type ChartOfAccount = {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  subType: string;
  description: string;
  isActive: boolean;
  parentAccountId?: string;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  createdDate: Date;
  lastModified: Date;
  createdBy: string;
  taxType?: 'Taxable' | 'Non-Taxable' | 'Tax-Only';
  bankAccountId?: string;
  tags: string[];
};

type BulkAccountOperationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: ChartOfAccount[];
  onBulkUpdate: (accountIds: string[], updates: Partial<ChartOfAccount>) => void;
  onBulkDelete: (accountIds: string[]) => void;
};

export function BulkAccountOperationDialog({
  open,
  onOpenChange,
  accounts,
  onBulkUpdate,
  onBulkDelete,
}: BulkAccountOperationDialogProps) {
  const { toast } = useToast();
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [operation, setOperation] = useState<'activate' | 'deactivate' | 'delete' | 'update-tax-type'>('activate');
  const [taxType, setTaxType] = useState<'Taxable' | 'Non-Taxable' | 'Tax-Only'>('Taxable');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(new Set(accounts.map(acc => acc.id)));
    } else {
      setSelectedAccounts(new Set());
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    const newSelected = new Set(selectedAccounts);
    if (checked) {
      newSelected.add(accountId);
    } else {
      newSelected.delete(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const getOperationDetails = () => {
    switch (operation) {
      case 'activate':
        return {
          title: 'Activate Accounts',
          description: 'Mark selected accounts as active',
          icon: <ArchiveRestore className="h-4 w-4" />,
          color: 'text-green-600',
          action: () => onBulkUpdate(Array.from(selectedAccounts), { isActive: true }),
        };
      case 'deactivate':
        return {
          title: 'Deactivate Accounts',
          description: 'Mark selected accounts as inactive',
          icon: <Archive className="h-4 w-4" />,
          color: 'text-orange-600',
          action: () => onBulkUpdate(Array.from(selectedAccounts), { isActive: false }),
        };
      case 'update-tax-type':
        return {
          title: 'Update Tax Type',
          description: `Set tax type to ${taxType} for selected accounts`,
          icon: <Tag className="h-4 w-4" />,
          color: 'text-blue-600',
          action: () => onBulkUpdate(Array.from(selectedAccounts), { taxType }),
        };
      case 'delete':
        return {
          title: 'Delete Accounts',
          description: 'Permanently delete selected accounts',
          icon: <Trash2 className="h-4 w-4" />,
          color: 'text-red-600',
          action: () => onBulkDelete(Array.from(selectedAccounts)),
        };
      default:
        return {
          title: '',
          description: '',
          icon: null,
          color: '',
          action: () => {},
        };
    }
  };

  const handleExecute = () => {
    if (selectedAccounts.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one account to perform the operation.",
        variant: "destructive",
      });
      return;
    }

    const operationDetails = getOperationDetails();
    
    // Check for potential issues with delete operation
    if (operation === 'delete') {
      const selectedAccountsList = accounts.filter(acc => selectedAccounts.has(acc.id));
      const accountsWithBalance = selectedAccountsList.filter(acc => Math.abs(acc.balance) > 0);
      const accountsWithChildren = selectedAccountsList.filter(acc => 
        accounts.some(child => child.parentAccountId === acc.id)
      );

      if (accountsWithBalance.length > 0 || accountsWithChildren.length > 0) {
        toast({
          title: "Cannot Delete Accounts",
          description: "Some selected accounts have balances or child accounts. Please resolve these issues first.",
          variant: "destructive",
        });
        return;
      }
    }

    operationDetails.action();
    
    toast({
      title: "Operation Successful",
      description: `${operationDetails.title} completed for ${selectedAccounts.size} account(s).`,
    });

    setSelectedAccounts(new Set());
    onOpenChange(false);
  };

  const operationDetails = getOperationDetails();
  const selectedAccountsList = accounts.filter(acc => selectedAccounts.has(acc.id));
  
  // Check for warnings
  const accountsWithBalance = selectedAccountsList.filter(acc => Math.abs(acc.balance) > 0);
  const accountsWithChildren = selectedAccountsList.filter(acc => 
    accounts.some(child => child.parentAccountId === acc.id)
  );

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-blue-100 text-blue-800';
      case 'Liability':
        return 'bg-red-100 text-red-800';
      case 'Equity':
        return 'bg-purple-100 text-purple-800';
      case 'Income':
        return 'bg-green-100 text-green-800';
      case 'Expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bulk Account Operations</DialogTitle>
          <DialogDescription>
            Select accounts to perform bulk operations. Be careful with destructive operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Operation Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select Operation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant={operation === 'activate' ? 'default' : 'outline'}
                onClick={() => setOperation('activate')}
                className="justify-start"
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Activate
              </Button>
              <Button
                variant={operation === 'deactivate' ? 'default' : 'outline'}
                onClick={() => setOperation('deactivate')}
                className="justify-start"
              >
                <Archive className="mr-2 h-4 w-4" />
                Deactivate
              </Button>
              <Button
                variant={operation === 'update-tax-type' ? 'default' : 'outline'}
                onClick={() => setOperation('update-tax-type')}
                className="justify-start"
              >
                <Tag className="mr-2 h-4 w-4" />
                Tax Type
              </Button>
              <Button
                variant={operation === 'delete' ? 'destructive' : 'outline'}
                onClick={() => setOperation('delete')}
                className="justify-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>

            {operation === 'update-tax-type' && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Tax Type:</label>
                <Select value={taxType} onValueChange={(value: any) => setTaxType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Taxable">Taxable</SelectItem>
                    <SelectItem value="Non-Taxable">Non-Taxable</SelectItem>
                    <SelectItem value="Tax-Only">Tax-Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Account Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Select Accounts ({selectedAccounts.size} selected)</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedAccounts.size === accounts.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">Select All</label>
              </div>
            </div>

            <ScrollArea className="h-64 border rounded-md p-4">
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={account.id}
                      checked={selectedAccounts.has(account.id)}
                      onCheckedChange={(checked) => handleSelectAccount(account.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {account.accountCode}
                          </span>
                          <span className="font-medium truncate">{account.accountName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getAccountTypeColor(account.accountType)}>
                            {account.accountType}
                          </Badge>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground truncate">
                          {account.description}
                        </span>
                        <span className={`text-sm font-medium ${
                          account.balance > 0 ? 'text-green-600' : 
                          account.balance < 0 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Operation Summary */}
          {selectedAccounts.size > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={operationDetails.color}>{operationDetails.icon}</span>
                  <h3 className="font-medium">{operationDetails.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {operationDetails.description} for {selectedAccounts.size} selected account(s).
                </p>

                {/* Warnings */}
                {operation === 'delete' && (accountsWithBalance.length > 0 || accountsWithChildren.length > 0) && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-red-800">Cannot Delete Some Accounts</p>
                        {accountsWithBalance.length > 0 && (
                          <p className="text-red-700">
                            {accountsWithBalance.length} account(s) have non-zero balances.
                          </p>
                        )}
                        {accountsWithChildren.length > 0 && (
                          <p className="text-red-700">
                            {accountsWithChildren.length} account(s) have child accounts.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {operation === 'deactivate' && accountsWithBalance.length > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800">Warning</p>
                        <p className="text-orange-700">
                          {accountsWithBalance.length} account(s) have non-zero balances. 
                          Deactivating them may affect reporting.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExecute}
            disabled={selectedAccounts.size === 0}
            variant={operation === 'delete' ? 'destructive' : 'default'}
          >
            Execute {operationDetails.title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
