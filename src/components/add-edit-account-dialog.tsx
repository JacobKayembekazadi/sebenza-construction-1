'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

export type ChartOfAccount = {
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

type AddEditAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: ChartOfAccount;
  accounts: ChartOfAccount[];
  bankAccounts: Array<{ id: string; bankName: string; accountNumber: string }>;
  onSave: (accountData: Omit<ChartOfAccount, 'id' | 'createdDate' | 'lastModified'> & { id?: string }) => void;
};

const accountTypes = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Income', label: 'Income' },
  { value: 'Expense', label: 'Expense' },
];

const subTypesByAccountType = {
  'Asset': ['Current Assets', 'Fixed Assets', 'Other Assets'],
  'Liability': ['Current Liabilities', 'Long-term Liabilities', 'Other Liabilities'],
  'Equity': ['Owner Equity', 'Retained Earnings', 'Other Equity'],
  'Income': ['Operating Revenue', 'Other Revenue', 'Investment Income'],
  'Expense': ['Cost of Goods Sold', 'Operating Expenses', 'Other Expenses'],
};

const taxTypes = [
  { value: 'none', label: 'None' },
  { value: 'Taxable', label: 'Taxable' },
  { value: 'Non-Taxable', label: 'Non-Taxable' },
  { value: 'Tax-Only', label: 'Tax-Only' },
];

export function AddEditAccountDialog({
  open,
  onOpenChange,
  account,
  accounts,
  bankAccounts,
  onSave,
}: AddEditAccountDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '' as ChartOfAccount['accountType'] | '',
    subType: '',
    description: '',
    isActive: true,
    parentAccountId: 'none',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    createdBy: 'Current User',
    taxType: 'none' as ChartOfAccount['taxType'] | 'none',
    bankAccountId: 'none',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        subType: account.subType,
        description: account.description,
        isActive: account.isActive,
        parentAccountId: account.parentAccountId || 'none',
        balance: account.balance,
        debitBalance: account.debitBalance,
        creditBalance: account.creditBalance,
        createdBy: account.createdBy,
        taxType: account.taxType || 'none',
        bankAccountId: account.bankAccountId || 'none',
        tags: account.tags,
      });
    } else {
      setFormData({
        accountCode: '',
        accountName: '',
        accountType: '',
        subType: '',
        description: '',
        isActive: true,
        parentAccountId: 'none',
        balance: 0,
        debitBalance: 0,
        creditBalance: 0,
        createdBy: 'Current User',
        taxType: 'none',
        bankAccountId: 'none',
        tags: [],
      });
    }
    setErrors({});
    setNewTag('');
  }, [account, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountCode.trim()) {
      newErrors.accountCode = 'Account code is required';
    } else if (!/^\d+$/.test(formData.accountCode)) {
      newErrors.accountCode = 'Account code must contain only numbers';
    } else {
      // Check for duplicate account codes (excluding current account if editing)
      const existingAccount = accounts.find(acc => 
        acc.accountCode === formData.accountCode && acc.id !== account?.id
      );
      if (existingAccount) {
        newErrors.accountCode = 'Account code already exists';
      }
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (formData.accountName.length < 3) {
      newErrors.accountName = 'Account name must be at least 3 characters';
    }

    if (!formData.accountType) {
      newErrors.accountType = 'Account type is required';
    }

    if (!formData.subType) {
      newErrors.subType = 'Sub type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate balance consistency for new accounts
    if (!account) {
      const totalBalance = formData.debitBalance - formData.creditBalance;
      if (Math.abs(totalBalance - formData.balance) > 0.01) {
        newErrors.balance = 'Balance must equal debit balance minus credit balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    const accountData = {
      ...formData,
      accountType: formData.accountType as ChartOfAccount['accountType'],
      taxType: formData.taxType === 'none' ? undefined : formData.taxType as ChartOfAccount['taxType'],
      parentAccountId: formData.parentAccountId === 'none' ? undefined : formData.parentAccountId || undefined,
      bankAccountId: formData.bankAccountId === 'none' ? undefined : formData.bankAccountId || undefined,
      ...(account && { id: account.id }),
    };

    onSave(accountData);
    onOpenChange(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleBalanceChange = (field: 'debitBalance' | 'creditBalance', value: number) => {
    setFormData(prev => {
      const updates = { [field]: value };
      if (field === 'debitBalance') {
        updates.balance = value - prev.creditBalance;
      } else {
        updates.balance = prev.debitBalance - value;
      }
      return { ...prev, ...updates };
    });
  };

  const availableSubTypes = formData.accountType ? subTypesByAccountType[formData.accountType] : [];
  const parentAccounts = accounts.filter(acc => 
    acc.accountType === formData.accountType && acc.id !== account?.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
          <DialogDescription>
            {account 
              ? 'Update the account information below.' 
              : 'Create a new chart of accounts entry.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountCode">Account Code *</Label>
                <Input
                  id="accountCode"
                  value={formData.accountCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountCode: e.target.value }))}
                  placeholder="e.g., 1000"
                  className={errors.accountCode ? 'border-red-500' : ''}
                />
                {errors.accountCode && (
                  <p className="text-sm text-red-500">{errors.accountCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="e.g., Cash - Operating Account"
                  className={errors.accountName ? 'border-red-500' : ''}
                />
                {errors.accountName && (
                  <p className="text-sm text-red-500">{errors.accountName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    accountType: value as ChartOfAccount['accountType'],
                    subType: '', // Reset subType when accountType changes
                    parentAccountId: '' // Reset parent when type changes
                  }))}
                >
                  <SelectTrigger className={errors.accountType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.accountType && (
                  <p className="text-sm text-red-500">{errors.accountType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subType">Sub Type *</Label>
                <Select
                  value={formData.subType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subType: value }))}
                  disabled={!formData.accountType}
                >
                  <SelectTrigger className={errors.subType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select sub type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubTypes.map((subType) => (
                      <SelectItem key={subType} value={subType}>
                        {subType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subType && (
                  <p className="text-sm text-red-500">{errors.subType}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this account"
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxType">Tax Type</Label>
                <Select
                  value={formData.taxType}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    taxType: value as ChartOfAccount['taxType'] | 'none'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentAccount">Parent Account</Label>
                <Select
                  value={formData.parentAccountId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentAccountId: value }))}
                  disabled={!formData.accountType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent</SelectItem>
                    {parentAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountCode} - {acc.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Linked Bank Account</Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bankAccountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Bank Account</SelectItem>
                  {bankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.bankName} - {bank.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Account is active</Label>
            </div>
          </div>

          {/* Balance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Balance Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="debitBalance">Debit Balance</Label>
                <Input
                  id="debitBalance"
                  type="number"
                  step="0.01"
                  value={formData.debitBalance}
                  onChange={(e) => handleBalanceChange('debitBalance', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditBalance">Credit Balance</Label>
                <Input
                  id="creditBalance"
                  type="number"
                  step="0.01"
                  value={formData.creditBalance}
                  onChange={(e) => handleBalanceChange('creditBalance', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Net Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  readOnly
                  className="bg-gray-50"
                />
                {errors.balance && (
                  <p className="text-sm text-red-500">{errors.balance}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {account ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
