'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, FileBarChart, Scale, Book, Landmark, TrendingUp, PieChart, BarChart3, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type FinancialReport = {
  id: string;
  title: string;
  description: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'general-ledger' | 'trial-balance' | 'custom';
  status: 'draft' | 'active' | 'archived';
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  createdDate: Date;
  lastGenerated?: Date;
  parameters: {
    includeSubaccounts: boolean;
    showComparisons: boolean;
    groupByCategory: boolean;
    includeCharts: boolean;
    format: 'pdf' | 'excel' | 'csv';
  };
  filters: {
    accountTypes?: string[];
    projects?: string[];
    clients?: string[];
    minimumAmount?: number;
  };
  createdBy: string;
  tags: string[];
};

type AddEditReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: FinancialReport;
  onSave: (report: Omit<FinancialReport, 'id'> & { id?: string }) => void;
};

const reportTypes = [
  { value: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp, description: 'Revenue and expense analysis' },
  { value: 'balance-sheet', label: 'Balance Sheet', icon: Scale, description: 'Assets, liabilities, and equity' },
  { value: 'cash-flow', label: 'Cash Flow', icon: LineChart, description: 'Cash inflows and outflows' },
  { value: 'general-ledger', label: 'General Ledger', icon: Book, description: 'All account transactions' },
  { value: 'trial-balance', label: 'Trial Balance', icon: Landmark, description: 'Account balance summary' },
  { value: 'custom', label: 'Custom Report', icon: BarChart3, description: 'Custom analysis report' },
];

const scheduleFrequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
];

const predefinedTags = [
  'Financial', 'Operations', 'Projects', 'Clients', 'Tax', 'Audit', 'Management', 'Board', 'Monthly', 'Quarterly'
];

export function AddEditReportDialog({
  open,
  onOpenChange,
  report,
  onSave,
}: AddEditReportDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(() => ({
    title: report?.title || '',
    description: report?.description || '',
    type: report?.type || 'profit-loss',
    status: report?.status || 'draft',
    isScheduled: report?.isScheduled || false,
    scheduleFrequency: report?.scheduleFrequency || 'monthly',
    startDate: report?.dateRange.startDate || new Date(new Date().getFullYear(), 0, 1),
    endDate: report?.dateRange.endDate || new Date(),
    includeSubaccounts: report?.parameters.includeSubaccounts ?? true,
    showComparisons: report?.parameters.showComparisons ?? false,
    groupByCategory: report?.parameters.groupByCategory ?? true,
    includeCharts: report?.parameters.includeCharts ?? true,
    format: report?.parameters.format || 'pdf',
    minimumAmount: report?.filters.minimumAmount?.toString() || '',
    tags: report?.tags || [],
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.type) newErrors.type = 'Report type is required';
    if (formData.startDate >= formData.endDate) newErrors.dateRange = 'End date must be after start date';
    if (formData.minimumAmount && (isNaN(Number(formData.minimumAmount)) || Number(formData.minimumAmount) < 0)) {
      newErrors.minimumAmount = 'Minimum amount must be a valid positive number';
    }

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

    const reportData: Omit<FinancialReport, 'id'> & { id?: string } = {
      ...formData,
      dateRange: {
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      parameters: {
        includeSubaccounts: formData.includeSubaccounts,
        showComparisons: formData.showComparisons,
        groupByCategory: formData.groupByCategory,
        includeCharts: formData.includeCharts,
        format: formData.format as 'pdf' | 'excel' | 'csv',
      },
      filters: {
        minimumAmount: formData.minimumAmount ? Number(formData.minimumAmount) : undefined,
      },
      createdDate: report?.createdDate || new Date(),
      createdBy: 'Current User', // This would come from auth context
      lastGenerated: report?.lastGenerated,
    };

    if (report) {
      reportData.id = report.id;
    }

    onSave(reportData);
    onOpenChange(false);

    toast({
      title: report ? 'Report Updated' : 'Report Created',
      description: `Financial report has been successfully ${report ? 'updated' : 'created'}.`,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const selectedReportType = reportTypes.find(type => type.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedReportType && <selectedReportType.icon className="h-5 w-5" />}
            {report ? 'Edit Financial Report' : 'Create Financial Report'}
          </DialogTitle>
          <DialogDescription>
            {report 
              ? 'Update the details of this financial report.' 
              : 'Create a new financial report with custom parameters and scheduling.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-destructive' : ''}
                  placeholder="Enter report title"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Report Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-destructive' : ''}
                placeholder="Describe what this report includes"
                rows={3}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => date && handleInputChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => date && handleInputChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {errors.dateRange && <p className="text-sm text-destructive">{errors.dateRange}</p>}
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduling</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="isScheduled"
                checked={formData.isScheduled}
                onCheckedChange={(value) => handleInputChange('isScheduled', value)}
              />
              <Label htmlFor="isScheduled">Enable automatic report generation</Label>
            </div>
            
            {formData.isScheduled && (
              <div className="space-y-2">
                <Label htmlFor="scheduleFrequency">Frequency</Label>
                <Select value={formData.scheduleFrequency} onValueChange={(value) => handleInputChange('scheduleFrequency', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleFrequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Report Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeSubaccounts"
                    checked={formData.includeSubaccounts}
                    onCheckedChange={(value) => handleInputChange('includeSubaccounts', value)}
                  />
                  <Label htmlFor="includeSubaccounts">Include sub-accounts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showComparisons"
                    checked={formData.showComparisons}
                    onCheckedChange={(value) => handleInputChange('showComparisons', value)}
                  />
                  <Label htmlFor="showComparisons">Show period comparisons</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="groupByCategory"
                    checked={formData.groupByCategory}
                    onCheckedChange={(value) => handleInputChange('groupByCategory', value)}
                  />
                  <Label htmlFor="groupByCategory">Group by category</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeCharts"
                    checked={formData.includeCharts}
                    onCheckedChange={(value) => handleInputChange('includeCharts', value)}
                  />
                  <Label htmlFor="includeCharts">Include charts and graphs</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumAmount">Minimum Amount Filter</Label>
              <Input
                id="minimumAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.minimumAmount}
                onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                className={errors.minimumAmount ? 'border-destructive' : ''}
              />
              {errors.minimumAmount && <p className="text-sm text-destructive">{errors.minimumAmount}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.tags.includes(tag)) {
                        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    className={formData.tags.includes(tag) ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {report ? 'Update Report' : 'Create Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
