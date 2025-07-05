'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export type BankTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  bankAccountId: string;
  category?: string;
  reference?: string;
  reconciled?: boolean;
};

type AddEditBankTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: BankTransaction;
  bankAccounts: Array<{ id: string; bankName: string; accountNumber: string }>;
  onSave: (transaction: Omit<BankTransaction, 'id'> & { id?: string }) => void;
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

export function AddEditBankTransactionDialog({
  open,
  onOpenChange,
  transaction,
  bankAccounts,
  onSave,
}: AddEditBankTransactionDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(() => ({
    date: transaction?.date || new Date().toISOString().split('T')[0],
    description: transaction?.description || '',
    amount: transaction?.amount?.toString() || '',
    type: transaction?.type || 'debit',
    bankAccountId: transaction?.bankAccountId || '',
    category: transaction?.category || '',
    reference: transaction?.reference || '',
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || isNaN(Number(formData.amount))) newErrors.amount = 'Valid amount is required';
    if (!formData.bankAccountId) newErrors.bankAccountId = 'Bank account is required';
    if (!formData.type) newErrors.type = 'Transaction type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors and try again.',
        variant: 'destructive',
      });
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      reconciled: transaction?.reconciled || false,
    };

    if (transaction) {
      onSave({ ...transactionData, id: transaction.id });
      toast({
        title: 'Transaction Updated',
        description: 'Bank transaction has been successfully updated.',
      });
    } else {
      onSave(transactionData);
      toast({
        title: 'Transaction Added',
        description: 'New bank transaction has been successfully added.',
      });
    }

    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Bank Transaction' : 'Add Bank Transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? 'Update the details of this bank transaction.' 
              : 'Add a new bank transaction to the system.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Transaction Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account *</Label>
              <Select 
                value={formData.bankAccountId} 
                onValueChange={(value) => handleInputChange('bankAccountId', value)}
              >
                <SelectTrigger className={errors.bankAccountId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankAccountId && <p className="text-sm text-destructive">{errors.bankAccountId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Money In)</SelectItem>
                  <SelectItem value="debit">Debit (Money Out)</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                placeholder="Transaction reference"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {transaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
