'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type BankTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reconciled?: boolean;
};

type DeleteBankTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: BankTransaction | null;
  onDelete: (transactionId: string) => void;
};

export function DeleteBankTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onDelete,
}: DeleteBankTransactionDialogProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction.id);
      toast({
        title: 'Transaction Deleted',
        description: 'The bank transaction has been successfully deleted.',
      });
    }
    onOpenChange(false);
  };

  if (!transaction) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bank Transaction</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this bank transaction? This action cannot be undone.</p>
            <div className="bg-muted p-3 rounded-md mt-3">
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.date} • 
                <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-destructive'}>
                  {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </p>
              {transaction.reconciled && (
                <p className="text-sm text-orange-600 font-medium mt-1">
                  ⚠️ This transaction is reconciled and may affect your reconciliation records.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
