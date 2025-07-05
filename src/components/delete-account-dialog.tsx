'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

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

type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: ChartOfAccount | null;
  accounts: ChartOfAccount[];
  onDelete: (accountId: string) => void;
};

export function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
  accounts,
  onDelete,
}: DeleteAccountDialogProps) {
  if (!account) return null;

  const handleDelete = () => {
    onDelete(account.id);
    onOpenChange(false);
  };

  // Check if account has child accounts
  const childAccounts = accounts.filter(acc => acc.parentAccountId === account.id);
  const hasChildAccounts = childAccounts.length > 0;

  // Check if account has transactions (in a real app, this would come from transaction data)
  const hasTransactions = Math.abs(account.balance) > 0;

  // Determine if deletion is safe
  const canDelete = !hasChildAccounts && !hasTransactions;

  const getBalanceIcon = () => {
    if (account.balance > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (account.balance < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <DollarSign className="h-4 w-4 text-gray-500" />;
  };

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Account</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{account.accountCode} - {account.accountName}</h3>
                <p className="text-sm text-muted-foreground">{account.description}</p>
              </div>
              <Badge className={getAccountTypeColor(account.accountType)}>
                {account.accountType}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Balance:</span>
              <div className="flex items-center gap-1">
                {getBalanceIcon()}
                <span className={`font-medium ${
                  account.balance > 0 ? 'text-green-600' : 
                  account.balance < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sub Type:</span>
              <span>{account.subType}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={account.isActive ? "default" : "secondary"}>
                {account.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Warning Messages */}
          {hasChildAccounts && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Cannot Delete Account</p>
                  <p className="text-yellow-700">
                    This account has {childAccounts.length} child account(s). You must delete or reassign child accounts first.
                  </p>
                  <div className="mt-2 space-y-1">
                    {childAccounts.slice(0, 3).map((child) => (
                      <p key={child.id} className="text-xs text-yellow-600">
                        • {child.accountCode} - {child.accountName}
                      </p>
                    ))}
                    {childAccounts.length > 3 && (
                      <p className="text-xs text-yellow-600">
                        ... and {childAccounts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasTransactions && !hasChildAccounts && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Warning: Account Has Transactions</p>
                  <p className="text-orange-700">
                    This account has a non-zero balance (${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}), 
                    which indicates it has associated transactions. Deleting it may affect your financial records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {canDelete && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Permanent Deletion</p>
                  <p className="text-red-700">
                    This will permanently delete the account and all its associated data. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!canDelete}
          >
            {canDelete ? 'Delete Account' : 'Cannot Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
