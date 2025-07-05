'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';

type BankTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reconciled?: boolean;
  category?: string;
};

type BulkOperationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: BankTransaction[];
  onBulkUpdate: (transactionIds: string[], updates: Partial<BankTransaction>) => void;
  onBulkDelete: (transactionIds: string[]) => void;
};

const transactionCategories = [
  'Income',
  'Equipment',
  'Materials', 
  'Labor',
  'Subcontractors',
  'Office Supplies',
  'Software Subscriptions',
  'Insurance',
  'Utilities',
  'Fuel',
  'Maintenance',
  'Other Expenses'
];

export function BulkOperationDialog({
  open,
  onOpenChange,
  transactions,
  onBulkUpdate,
  onBulkDelete,
}: BulkOperationDialogProps) {
  const { toast } = useToast();
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [operation, setOperation] = useState<'delete' | 'update-category' | 'mark-reconciled' | 'mark-unreconciled'>('update-category');
  const [newCategory, setNewCategory] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleExecute = () => {
    const selectedIds = Array.from(selectedTransactions);
    
    if (selectedIds.length === 0) {
      toast({
        title: 'No Transactions Selected',
        description: 'Please select at least one transaction to perform bulk operations.',
        variant: 'destructive',
      });
      return;
    }

    switch (operation) {
      case 'delete':
        onBulkDelete(selectedIds);
        toast({
          title: 'Transactions Deleted',
          description: `Successfully deleted ${selectedIds.length} transaction(s).`,
        });
        break;
      case 'update-category':
        if (!newCategory) {
          toast({
            title: 'Category Required',
            description: 'Please select a category for the update operation.',
            variant: 'destructive',
          });
          return;
        }
        onBulkUpdate(selectedIds, { category: newCategory });
        toast({
          title: 'Category Updated',
          description: `Successfully updated category for ${selectedIds.length} transaction(s).`,
        });
        break;
      case 'mark-reconciled':
        onBulkUpdate(selectedIds, { reconciled: true });
        toast({
          title: 'Transactions Marked as Reconciled',
          description: `Successfully marked ${selectedIds.length} transaction(s) as reconciled.`,
        });
        break;
      case 'mark-unreconciled':
        onBulkUpdate(selectedIds, { reconciled: false });
        toast({
          title: 'Transactions Marked as Unreconciled',
          description: `Successfully marked ${selectedIds.length} transaction(s) as unreconciled.`,
        });
        break;
    }

    setSelectedTransactions(new Set());
    onOpenChange(false);
  };

  const selectedCount = selectedTransactions.size;
  const allSelected = selectedCount === transactions.length;
  const someSelected = selectedCount > 0 && selectedCount < transactions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
          <DialogDescription>
            Select transactions and choose an operation to perform on multiple items at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
              />
              <span className="text-sm">
                Select All ({selectedCount} of {transactions.length} selected)
              </span>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update-category">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Update Category
                    </div>
                  </SelectItem>
                  <SelectItem value="mark-reconciled">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark as Reconciled
                    </div>
                  </SelectItem>
                  <SelectItem value="mark-unreconciled">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Mark as Unreconciled
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {operation === 'update-category' && (
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="border rounded-md flex-1 overflow-auto">
            <div className="max-h-[400px] overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedTransactions.has(transaction.id)}
                    onCheckedChange={(checked) => 
                      handleSelectTransaction(transaction.id, checked as boolean)
                    }
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{transaction.description}</span>
                      {transaction.reconciled && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Reconciled
                        </Badge>
                      )}
                      {transaction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{transaction.date}</span>
                      <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-destructive'}>
                        {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExecute}
            variant={operation === 'delete' ? 'destructive' : 'default'}
            disabled={selectedCount === 0}
          >
            {operation === 'delete' && 'Delete'} 
            {operation === 'update-category' && 'Update Category'}
            {operation === 'mark-reconciled' && 'Mark as Reconciled'}
            {operation === 'mark-unreconciled' && 'Mark as Unreconciled'}
            {selectedCount > 0 && ` (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
